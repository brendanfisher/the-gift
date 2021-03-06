## Dockerfile to build opencv from sources with CUDA support
## Creator : Thomas Herbin
## Heavily based on Josip Janzic file
##
## 20 december 2017

FROM nvidia/cuda:10.0-devel

ARG https_proxy
ARG http_proxy

########################
###  OPENCV INSTALL  ###
########################

ARG OPENCV_VERSION=3.4.4
ARG OPENCV_INSTALL_PATH=/opencv/usr

RUN apt-get update && \
        apt-get install -y \
	python-pip \
        build-essential \
        cmake \
        git \
        wget \
        unzip \
        yasm \
        pkg-config \
        libswscale-dev \
        libtbb2 \
        libtbb-dev \
        libjpeg-dev \
        libpng-dev \
        libtiff-dev \
        libavformat-dev \
        libpq-dev \

	libxine2-dev \
	libglew-dev \
	libtiff5-dev \
	zlib1g-dev \
	libjpeg-dev \
	libavcodec-dev \
	libavformat-dev \
	libavutil-dev \
	libpostproc-dev \
	libswscale-dev \
	libeigen3-dev \
	libtbb-dev \
	libgtk2.0-dev \
	pkg-config \
        ##
        ## Python
        python-dev \
        python-numpy \
        python3-dev \
        python3-numpy \
	## VTK
	#libvtk6-dev \
    ## Cleanup
    && rm -rf /var/lib/apt/lists/*

#RUN pip install numpy

## Create install directory
## Force success as the only reason for a fail is if it exist

RUN mkdir -p $OPENCV_INSTALL_PATH; exit 0

WORKDIR /

## Single command to reduce image size
## Build opencv
RUN wget https://github.com/opencv/opencv/archive/$OPENCV_VERSION.zip \
    && unzip $OPENCV_VERSION.zip \
    && mkdir /opencv-$OPENCV_VERSION/cmake_binary \
    && cd /opencv-$OPENCV_VERSION/cmake_binary \
    && cmake -DBUILD_TIFF=ON \
       ##
       ## Should compile for most card
       ## 3.5 binary code for devices with compute capability 3.5 and 3.7,
       ## 5.0 binary code for devices with compute capability 5.0 and 5.2,
       ## 6.0 binary code for devices with compute capability 6.0 and 6.1,
       ##
       ## AVX in dispatch because not all machines have it
       -DBUILD_TESTS=OFF \
       -DBUILD_PERF_TESTS=OFF \
       -DCMAKE_BUILD_TYPE=RELEASE \
       -DCMAKE_INSTALL_PREFIX=$OPENCV_INSTALL_PATH \
    .. \
    ##
    ## Add variable to enable make to use all cores
    && export NUMPROC=$(nproc --all) \
    && make -j$NUMPROC install \
    ## Remove following lines if you need to move openCv
    && rm /$OPENCV_VERSION.zip \
    && rm -r /opencv-$OPENCV_VERSION

## Compress the openCV files so you can extract them from the docker easily 
RUN tar cvzf opencv-$OPENCV_VERSION.tar.gz --directory=$OPENCV_INSTALL_PATH .

COPY . /app
WORKDIR /app
ENV LD_LIBRARY_PATH="/usr/local/lib:/usr/local/cuda-10.0/lib64:/opencv/usr/lib"
