cmake_minimum_required(VERSION 3.10.2)
project(spectrogram_gpu)

add_subdirectory(pybind11)
pybind11_add_module(cmake_test test.cpp Spectrogram.cpp Spectrogram.h Window.h)

target_link_libraries(cmake_test PUBLIC OpenCL clFFT)

set(CMAKE_CXX_STANDARD 14)
