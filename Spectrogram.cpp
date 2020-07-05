#include "Spectrogram.h"

#include <pybind11/pybind.h>
#include <pybind11/numpy.h>
#include <pybind11/stl.h>
#include <stdlib.h>


Spectrogram::Spectrogram() : props({CL_CONTEXT_PLATFORM, 0, 0})
{
    cl_int err;

    // OpenCL setup
    err = clGetPlatformIDs(1, &platform, NULL);
    err |= clGetDeviceIDs(platform, CL_DEVICE_TYPE_GPU, 1, &device, NULL);

    if(err)
        std::cout << "Setup error: " << err << std::endl;

    props[1] = (cl_context_properties)platform;

    ctx = clCreateContext(props, 1, &device, NULL, NULL, &err);

    if(err)
        std::cout << "Contex error: " << err << std::endl;

    queue = clCreateCommandQueue(ctx, device, 0, &err);

    if(err)
        std::cout << "Queue error: " << err << std::endl;

    // clFFT setup
    err = clfftInitSetupData(&fftSetup);
    err |= clfftSetup(&fftSetup);

    if(err)
        std::cout << "clFFT setup error: " << err << std::endl;

}

void Spectrogram::SetFFT()
{

}

Spectrogram::~Spectrogram()
{
    // clFFT cleanup
    clfftTeardown();

    // OpenCL cleanup
    clReleaseCommandQueue(queue);
    clReleaseContext(ctx);
}
