#include <stdio.h>
#include <math.h>
#include <opencv2/opencv.hpp>
#include <opencv2/highgui/highgui.hpp>
#include <cuda_runtime.h>
#include <thrust/device_vector.h>
#include <thrust/copy.h>

const long int VID_WIDTH=1920, VID_HEIGHT=1080, FACE_WIDTH=256, FACE_HEIGHT=384;	// Video image, and block sizes
const int BLOCK_SIZE=256;

// Interpolates between keyframes for all frames of video motion tracking data
__global__ void interpolate(int* keyFrames, int* frameData, int numKeyframes, int numFrames){
	int idx=threadIdx.x+blockIdx.x*blockDim.x;
	if(idx<numFrames){
		int startFrame=0;	//	Find index of preceding keyframe
		for(int i=1; i<=numKeyframes; i++){
			if(idx<=(int)keyFrames[i*3]){
				startFrame=i-1;
				break;
			}
		}
		int t=idx-keyFrames[startFrame*3];
		int dt=keyFrames[(startFrame+1)*3]-keyFrames[startFrame*3];
		int dx=keyFrames[(startFrame+1)*3+1]-keyFrames[startFrame*3+1];
		int dy=keyFrames[(startFrame+1)*3+2]-keyFrames[startFrame*3+2];
		frameData[idx*2]=keyFrames[startFrame*3+1]+dx*t/dt;
		frameData[idx*2+1]=keyFrames[startFrame*3+2]+dy*t/dt;
	}
	__syncthreads();
}

// Sets pixels outside of face oval to (0, 0, 0) so they can be filtered out
__global__ void processFace(uchar3* face){
	int idx=threadIdx.x+blockIdx.x*blockDim.x;
	if(idx<FACE_WIDTH*FACE_HEIGHT){
		int x=idx%FACE_WIDTH;
		int y=idx/FACE_WIDTH;
		int xc=FACE_WIDTH/2, yc=FACE_HEIGHT/2;
		if(face[x+y*FACE_WIDTH].x==0 && face[x+y*FACE_WIDTH].y==0 && face[x+y*FACE_WIDTH].z==0)	// if already (0, 0, 0), change slightly so it is not removed
			face[x+y*FACE_WIDTH].x=1;
		if((float)((x-xc)*(x-xc))/(xc*xc)+(float)((y-yc)*(y-yc))/(yc*yc)>1){
			face[idx].x=0;
			face[idx].y=0;
			face[idx].z=0;
		}
	}
	__syncthreads();
}

// Overlays face onto a single frame
__global__ void processFrame(uchar3* face, uchar3* frame, int xOffset, int yOffset, int xc, int yc, int fxc, int fyc){
	int idx=threadIdx.x+blockIdx.x*blockDim.x;
	if(idx<FACE_WIDTH*FACE_HEIGHT && face[idx].x!=0 && face[idx].y!=0 && face[idx].z!=0){
		int face_x=idx%FACE_WIDTH;
		int face_y=idx/FACE_WIDTH;
		int frame_x=xc+xOffset+face_x-fxc;
		int frame_y=yc-yOffset+face_y-fyc;
		if(frame_x<VID_WIDTH && frame_x>=0 && frame_y<VID_HEIGHT && frame_y>=0 && face[face_x+face_y*FACE_WIDTH].x!=0 && face[face_x+face_y*FACE_WIDTH].y!=0 && face[face_x+face_y*FACE_WIDTH].z!=0){
			frame[frame_x+frame_y*VID_WIDTH].x=face[face_x+face_y*FACE_WIDTH].x;
			frame[frame_x+frame_y*VID_WIDTH].y=face[face_x+face_y*FACE_WIDTH].y;
			frame[frame_x+frame_y*VID_WIDTH].z=face[face_x+face_y*FACE_WIDTH].z;
		}
	}
	__syncthreads();
}

// Overlays face onto all frames in video
__global__ void processFrames(uchar3* face, uchar3* video, int* frameData, int numFrames, int xc, int yc, int fxc, int fyc){
	int idx=threadIdx.x+blockIdx.x*blockDim.x+(threadIdx.y+blockIdx.y*blockDim.y)*BLOCK_SIZE;	// Video pixel index, use x and y to prevent exceeding thread/block limit
	int idx2=idx%(FACE_WIDTH*FACE_HEIGHT);	// Face index
	if(idx<FACE_WIDTH*FACE_HEIGHT*numFrames && face[idx2].x!=0 && face[idx2].y!=0 && face[idx2].z!=0){
		int frame=idx/(FACE_WIDTH*FACE_HEIGHT);
		int face_x=idx2%FACE_WIDTH;
		int face_y=idx2/FACE_WIDTH;
		int frame_x=xc+frameData[idx*2]+face_x-fxc;
		int frame_y=yc-frameData[idx*2+1]+face_y-fyc;
		if(frame_x<VID_WIDTH && frame_x>=0 && frame_y<VID_HEIGHT && frame_y>=0){
			video[frame_x+frame_y*VID_WIDTH+VID_WIDTH*VID_HEIGHT*frame].x=face[idx2].x;
			video[frame_x+frame_y*VID_WIDTH+VID_WIDTH*VID_HEIGHT*frame].y=face[idx2].y;
			video[frame_x+frame_y*VID_WIDTH+VID_WIDTH*VID_HEIGHT*frame].z=face[idx2].z;
		}
	}
	__syncthreads();
}

void d_interpolate(int* h_keyFrames, int* h_frameData, int numKeyframes, int numFrames){
	thrust::device_vector<int> d_keyFrames(h_keyFrames, h_keyFrames+numKeyframes*3);
	thrust::device_vector<int> d_frameData(h_frameData, h_frameData+numFrames*3);
	interpolate<<<numFrames/BLOCK_SIZE+1, BLOCK_SIZE>>>(thrust::raw_pointer_cast(&d_keyFrames[0]), thrust::raw_pointer_cast(&d_frameData[0]), numKeyframes, numFrames);
	thrust::copy(d_frameData.begin(), d_frameData.end(), h_frameData);
}

void d_processFace(uchar3* h_face){
	thrust::device_vector<uchar3> d_face(h_face, h_face+FACE_WIDTH*FACE_HEIGHT);
	processFace<<<FACE_WIDTH*FACE_HEIGHT/BLOCK_SIZE, BLOCK_SIZE>>>(thrust::raw_pointer_cast(&d_face[0]));
	thrust::copy(d_face.begin(), d_face.end(), h_face);
}

void d_processFrame(uchar3* h_face, uchar3* h_frame, int xOffset, int yOffset){
	thrust::device_vector<uchar3> d_face(h_face, h_face+FACE_WIDTH*FACE_HEIGHT);
	thrust::device_vector<uchar3> d_frame(h_frame, h_frame+VID_WIDTH*VID_HEIGHT);
	processFrame<<<FACE_WIDTH*FACE_HEIGHT/BLOCK_SIZE, BLOCK_SIZE>>>(thrust::raw_pointer_cast(&d_face[0]), thrust::raw_pointer_cast(&d_frame[0]), xOffset, yOffset, VID_WIDTH/2, VID_HEIGHT/2, FACE_WIDTH/2, FACE_HEIGHT/2);
	thrust::copy(d_frame.begin(), d_frame.end(), h_frame);
}

// Not currently working
void d_processFrames(uchar3* h_face, uchar3* h_video, int* h_frameData, int numFrames){
	thrust::device_vector<uchar3> d_face(h_face, h_face+FACE_WIDTH*FACE_HEIGHT);
	thrust::device_vector<uchar3> d_video(h_video, h_video+VID_WIDTH*VID_HEIGHT*numFrames);
	thrust::device_vector<int> d_frameData(h_frameData, h_frameData+numFrames*2);
	int dim=sqrt(VID_HEIGHT*VID_WIDTH*numFrames)+1;
	dim3 BLOCK2D(BLOCK_SIZE, BLOCK_SIZE);
	dim3 NUMBLOCKS2D(dim/BLOCK_SIZE, dim/BLOCK_SIZE);
//	processFrames<<<FACE_WIDTH*FACE_HEIGHT/BLOCK_SIZE*numFrames, BLOCK_SIZE>>>(thrust::raw_pointer_cast(&d_face[0]), thrust::raw_pointer_cast(&d_video[0]), thrust::raw_pointer_cast(&d_frameData[0]), numFrames, VID_WIDTH/2, VID_HEIGHT/2, FACE_WIDTH/2, FACE_HEIGHT/2);
	processFrames<<<NUMBLOCKS2D, BLOCK2D>>>(thrust::raw_pointer_cast(&d_face[0]), thrust::raw_pointer_cast(&d_video[0]), thrust::raw_pointer_cast(&d_frameData[0]), numFrames, VID_WIDTH/2, VID_HEIGHT/2, FACE_WIDTH/2, FACE_HEIGHT/2);
	thrust::copy(d_video.begin(), d_video.end(), h_video);	// Throws error
}
