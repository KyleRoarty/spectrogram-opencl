#include "Spectrogram.h"

#include <cmath>
#include "Window.h"


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

py::array_t<std::complex<float>>
Spectrogram::RunFFT(py::array_t<float, py::array::c_style | py::array::forcecast> inSamples, size_t fft_len, size_t num_overlap)
{
    float *samplesPtr = (float *)inSamples.request().ptr;
    size_t num_kerns = std::ceil((float)fft_len/(fft_len-num_overlap));
    size_t in_strides[2] = {1, fft_len};
    size_t out_strides[2] = {1, fft_len/2 + 1};
    size_t num_ffts = std::floor((float)inSamples.size()/(num_kerns*(fft_len-num_overlap)));


    // Throw this stuff in a private function? Maybe
    // planHandle needs to be a member variable
    clfftPlanHandle *planHandle = new clfftPlanHandle[num_kerns];

    // First fft plan
    // Not intending on doing anything other than 1D FFTs
    size_t clLengths[1] = {fft_len};
    clfftCreateDefaultPlan(&planHandle[0], ctx, CLFFT_1D, clLengths);
    // Need something in case we can pass in doubles
    clfftSetPlanPrecision(planHandle[0], CLFFT_SINGLE);
    clfftSetResultLocation(planHandle[0], CLFFT_OUTOFPLACE);
    clfftSetLayout(planHandle[0], CLFFT_REAL, CLFFT_HERMITIAN_INTERLEAVED);

    clfftSetPlanDistance(planHandle[0], in_strides[1], num_kerns*out_strides[1]);
    clfftSetPlanInStride(planHandle[0], CLFFT_2D, in_strides);
    clfftSetPlanOutStride(planHandle[0], CLFFT_2D, out_strides);

    clfftSetPlanBatchSize(planHandle[0], num_ffts);

    // Generate userdata for callbacks
    int (*h_userdata)[2] = new int[num_kerns][2];
    cl_mem *userdata = new cl_mem[num_kerns];

    for(int i = 0; i < num_kerns; i++)
    {
        h_userdata[i][0] = (int)fft_len;
        h_userdata[i][1] = (int)i * num_overlap;
        userdata[i] = clCreateBuffer(ctx, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, 2*sizeof(int), h_userdata[i], NULL);
    }

    // Set callbacks here
    //clfftSetPlanCallback(planHandle[0], "hann", Window::hann, 0, PRECALLBACK, &userdata[0], 1);
    clfftSetPlanCallback(planHandle[0], "none", Window::none, 0, PRECALLBACK, &userdata[0], 1);

    clfftBakePlan(planHandle[0], 1, &queue, NULL, NULL);

    for(int i = 1; i < num_kerns; ++i)
    {
        clfftCopyPlan(&planHandle[i], ctx, planHandle[0]);
        // Set callbacks here
        //clfftSetPlanCallback(planHandle[i], "hann", Window::hann, 0, PRECALLBACK, &userdata[i], 1);
        clfftSetPlanCallback(planHandle[i], "none", Window::none, 0, PRECALLBACK, &userdata[i], 1);
        clfftSetPlanCallback(planHandle[i], "post_offset", Window::post_offset, 0, POSTCALLBACK, &userdata[i], 1);
        clfftBakePlan(planHandle[i], 1, &queue, NULL, NULL);
    }
    //TODO: Multiply num_ffts by num_kerns
    // Put this in private function, too?
    cl_mem bufX, bufOut;
    cl_int err;
    bufX = clCreateBuffer(ctx, CL_MEM_READ_WRITE, inSamples.size()*sizeof(*samplesPtr), NULL, &err);
    clEnqueueWriteBuffer(queue, bufX, CL_TRUE, 0, inSamples.size()*sizeof(*samplesPtr), samplesPtr, 0, NULL, NULL);

    bufOut = clCreateBuffer(ctx, CL_MEM_READ_WRITE, num_kerns*num_ffts*(1 + fft_len/2)*sizeof(std::complex<float>), NULL, &err);

    for(int i = 0; i < num_kerns; ++i)
        clfftEnqueueTransform(planHandle[i], CLFFT_FORWARD, 1, &queue, 0, NULL, NULL, &bufX, &bufOut, NULL);

    clFinish(queue);

    // Get data
    //std::complex<float> *specOut = new std::complex<float>[(1 + fft_len/2)*num_ffts*num_kerns];
    std::complex<float> *specOut = (std::complex<float> *)malloc((1 + fft_len/2)*num_ffts*num_kerns*sizeof(std::complex<float>));
    clEnqueueReadBuffer(queue, bufOut, CL_TRUE, 0, (1 + fft_len/2)*num_ffts*num_kerns*sizeof(*specOut), specOut, 0, NULL, NULL);
    auto retVal = py::array_t<std::complex<float>>((1+fft_len/2)*num_ffts*num_kerns, specOut);
    retVal.resize({num_ffts*num_kerns, 1 + fft_len/2});

    return retVal;
}

Spectrogram::~Spectrogram()
{
    // clFFT cleanup
    clfftTeardown();

    // OpenCL cleanup
    clReleaseCommandQueue(queue);
    clReleaseContext(ctx);
}
