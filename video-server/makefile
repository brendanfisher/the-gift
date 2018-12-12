OPENCV_INCLUDE=-I /usr/local/include
OPENCV_LIB=-L /usr/local/lib
CUDA_INCLUDE=-I /usr/local/cuda-10.0/include
LFLAGS=-lopencv_core -lopencv_imgproc -lopencv_imgcodecs -lopencv_highgui -lopencv_videoio
NVCC_OPTS=-O3 -arch=sm_60 -Xcompiler -Wall -Xcompiler -Wextra -m64
GCC_OPTS=-O3 -Wall -Wextra -m64

all: main.o kernels.o makefile
	nvcc -o Process main.o kernels.o $(OPENCV_LIB) $(LFLAGS) $(NVCC_OPTS)

main.o: main.cpp json.hpp
	g++ -c main.cpp $(GCC_OPTS) $(CUDA_INCLUDE) $(OPENCV_INCLUDE)

kernels.o: kernels.cu
	nvcc -c kernels.cu $(NVCC_OPTS)
