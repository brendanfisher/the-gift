#include <stdio.h>
#include <fstream>
#include <math.h>
#include <ctime>
#include <opencv2/opencv.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/core/cuda.hpp>
#include <opencv2/videoio.hpp>
#include <cuda_runtime.h>
#include "json.hpp"

const long int VID_WIDTH=1920, VID_HEIGHT=1080, FACE_WIDTH=256, FACE_HEIGHT=384;	// Video and image sizes

// Device function definitions
void d_interpolate(int* h_keyFrames, int* h_frameData, int numKeyFrames, int numFrames);
void d_processFace(uchar3* h_face);
void d_processFrame(uchar3* h_face, uchar3* h_frame, int xOffset, int yOffset);
void d_processFrames(uchar3* h_face, uchar3* h_frame, int* frameData, int numFrames);

// Interpolates between keyframes for all frames of video motion tracking data
void h_interpolate(int* keyFrames, int* frameData, int numKeyframes){
	for(int i=0; i<numKeyframes; i++){
		int t=0;
		int dt=keyFrames[(i+1)*3]-keyFrames[i*3];
		float dx=keyFrames[(i+1)*3+1]-keyFrames[i*3+1];
		float dy=keyFrames[(i+1)*3+2]-keyFrames[i*3+2];
		for(int j=keyFrames[i*3]; j<=keyFrames[(i+1)*3]; j++){
			frameData[j*2]=keyFrames[i*3+1]+dx*t/dt;
			frameData[j*2+1]=keyFrames[i*3+2]+dy*t/dt;
			t++;
		}
	}
}

// Sets pixels outside of face oval to (0, 0, 0) so they can be filtered out
void h_processFace(uchar3* face){
	int xc=FACE_WIDTH/2, yc=FACE_HEIGHT/2;
	for(int x=0; x<FACE_WIDTH; x++){
		for(int y=0; y<FACE_HEIGHT; y++){
			if(face[x+y*FACE_WIDTH].x==0 && face[x+y*FACE_WIDTH].y==0 && face[x+y*FACE_WIDTH].z==0)	// if already (0, 0, 0), change slightly so it is not removed
				face[x+y*FACE_WIDTH].x=1;
			if(pow(x-xc, 2)/(xc*xc)+pow(y-yc, 2)/(yc*yc)>1){
				face[x+y*FACE_WIDTH].x=0;
				face[x+y*FACE_WIDTH].y=0;
				face[x+y*FACE_WIDTH].z=0;
			}
		}
	}
}

// Overlays face onto a single frame
void h_processFrame(uchar3* face, uchar3* frame, int xOffset, int yOffset){
	int xc=VID_WIDTH/2;
	int yc=VID_HEIGHT/2;
	int fxc=FACE_WIDTH/2;
	int fyc=FACE_HEIGHT/2;
	int frame_x=0, frame_y=0;
	for(int x=0; x<FACE_WIDTH; x++){
		for(int y=0; y<FACE_HEIGHT; y++){
			frame_x=xc+xOffset+x-fxc;
			frame_y=yc-yOffset+y-fyc;
			if(frame_x<VID_WIDTH && frame_x>=0 && frame_y<VID_HEIGHT && frame_y>=0 && face[x+y*FACE_WIDTH].x!=0 && face[x+y*FACE_WIDTH].y!=0 && face[x+y*FACE_WIDTH].z!=0){
				frame[frame_x+frame_y*VID_WIDTH].x=face[x+y*FACE_WIDTH].x;
				frame[frame_x+frame_y*VID_WIDTH].y=face[x+y*FACE_WIDTH].y;
				frame[frame_x+frame_y*VID_WIDTH].z=face[x+y*FACE_WIDTH].z;
			}
		}
	}
}

// Overlays face onto all frames in video
void h_processFrames(uchar3* face, uchar3* video, int* frameData, int numFrames){
	int xc=VID_WIDTH/2;
	int yc=VID_HEIGHT/2;
	int fxc=FACE_WIDTH/2;
	int fyc=FACE_HEIGHT/2;
	long int frame_x, frame_y;
	for(long int i=0; i<numFrames; i++){
		for(int x=0; x<FACE_WIDTH; x++){
			for(int y=0; y<FACE_HEIGHT; y++){
				frame_x=xc+frameData[i*2]+x-fxc;
				frame_y=yc-frameData[i*2+1]+y-fyc;
				if(frame_x<VID_WIDTH && frame_x>=0 && frame_y<VID_HEIGHT && frame_y>=0 && face[x+y*FACE_WIDTH].x!=0 && face[x+y*FACE_WIDTH].y!=0 && face[x+y*FACE_WIDTH].z!=0){
					video[frame_x+frame_y*VID_WIDTH+i*VID_WIDTH*VID_HEIGHT].x=face[x+y*FACE_WIDTH].x;
					video[frame_x+frame_y*VID_WIDTH+i*VID_WIDTH*VID_HEIGHT].y=face[x+y*FACE_WIDTH].y;
					video[frame_x+frame_y*VID_WIDTH+i*VID_WIDTH*VID_HEIGHT].z=face[x+y*FACE_WIDTH].z;
				}
			}
		}
	}
}

int main(int argc, char* argv[]){
	if(argc!=5){	// Check for correct arguments
		printf("Usage: Process video.mp4 motion-tracking.json image.jpg output.mp4\n");
		return 0;
	}
	
// Load, crop, and resize face image
	cv::Mat image(cv::imread(argv[3], cv::IMREAD_COLOR));
	cv::Rect crop(image.cols/2-image.rows*.4/1.5, image.rows*.1, image.rows*.8/1.5, image.rows*.8);
	cv::Mat face=image(crop);
	cv::resize(face, face, cv::Size(FACE_WIDTH, FACE_HEIGHT));
	
// load motion tracking data
	std::ifstream file("motion-tracking.json", std::ifstream::binary);
	nlohmann::json values;
	values << file;
	
// Move data from json object to array
	int* keyFrames=new int[values.size()*3];
	for(int i=0; i<values.size(); i++){
		keyFrames[i*3]=(int)values[i]["time"].get<float>();
		keyFrames[i*3+1]=(int)values[i]["x"].get<float>();
		keyFrames[i*3+2]=(int)values[i]["y"].get<float>();
	}
	
	int numFrames=(int)values[values.size()-1]["time"].get<float>()+1;
	int* frameData=new int[numFrames*2];//(int*)malloc(sizeof(int)*numFrames*2);
	
	//h_interpolate(keyFrames, frameData, values.size());	// Serial host code
	d_interpolate(keyFrames, frameData, values.size(), numFrames);	// Parallel device code
	
	//h_processFace((uchar3*)face.ptr<unsigned char>(0));	// Serial host code
	d_processFace((uchar3*)face.ptr<unsigned char>(0));	// Parallel device code
	
// Initialize video capture and writer, frame buffer
	cv::VideoCapture cap(argv[1], cv::CAP_FFMPEG);
	cv::VideoWriter writer(argv[4], cap.get(CV_CAP_PROP_FOURCC), 30, cv::Size(VID_WIDTH, VID_HEIGHT));
	cv::Mat nextFrame;
	
//	Processes entire video at once, currently not working
/*	cv::Mat video(VID_HEIGHT*numFrames, VID_WIDTH, CV_8UC3);	// Mat for storing all frames from video
	for(int i=0; i<numFrames; i++){	// Read frame into array
		nextFrame=video.colRange(0, VID_WIDTH).rowRange(VID_HEIGHT*i, VID_HEIGHT*(i+1));	// Update where nextFrame points to in video
		cap.grab();
		cap.retrieve(nextFrame);
	}
	
	//h_processFrames((uchar3*)face.ptr<unsigned char>(0), (uchar3*)video.ptr<unsigned char>(0), frameData, numFrames);	// Serial host code
	d_processFrames((uchar3*)face.ptr<unsigned char>(0), (uchar3*)video.ptr<unsigned char>(0), frameData, numFrames);	// Parallel device code
	
	for(int i=0; i<numFrames; i++){
		nextFrame=cv::Mat(video(cv::Rect(0, VID_HEIGHT*i, VID_WIDTH, VID_HEIGHT)));	// Update where nextFrame points to in video
		writer.write(nextFrame);
	}*/
	
// Processes video frame by frame, slower
	int n=0;
	while(cap.grab()){
		cap.retrieve(nextFrame);
		//h_processFrame((uchar3*)face.ptr<unsigned char>(0), (uchar3*)nextFrame.ptr<unsigned char>(0), frameData[n*2], frameData[n*2+1]);	// Serial host code
		d_processFrame((uchar3*)face.ptr<unsigned char>(0), (uchar3*)nextFrame.ptr<unsigned char>(0), frameData[n*2], frameData[n*2+1]);	// Parallel device code
		n++;
		writer.write(nextFrame);
	}
}
