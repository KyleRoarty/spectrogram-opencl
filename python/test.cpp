#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>
#include <pybind11/stl.h>
#include <stdlib.h>

#include "Spectrogram.h"
#include <clFFT.h>

const char *precallbackstr = "\
float pre_fft( \
__global void *input, \
uint inoffset, \
__global void *userdata) \
{ \
  int fft_len = *(__global int *)userdata; \
  int fft_offset = *((__global int *)userdata + 1); \
  int fft_idx = inoffset % fft_len + fft_offset; \
  float scalar = 0.5 - 0.5*cos(M_PI_F*2*fft_idx/(fft_len - 1)); \
  return *((__global float*)input + inoffset) * scalar; \
}";

const char *precallbackstr_off = "\
float pre_fft_off( \
__global void *input, \
uint inoffset, \
__global void *userdata) \
{ \
  int fft_len = *(__global int *)userdata; \
  int fft_offset = *((__global int *)userdata + 1); \
  int fft_idx = (inoffset) % fft_len; \
  float scalar = 0.5 - 0.5*cos(M_PI_F*2*fft_idx/(fft_len - 1)); \
  return *((__global float*)input + inoffset + fft_offset) * scalar; \
}";

const char *post_off = "\
void post_fft_off( \
 __global void *output, \
uint outoffset, \
__global void *userdata, \
float2 fftoutput) \
{ \
  int fft_offset = *((__global int *)userdata + 1); \
  *((__global float2*)output + outoffset + fft_offset + 1) = fftoutput; \
}";

const char *precallbackstr_2 = "\
float pre_fft( \
__global void *input, \
uint inoffset, \
__global void *userdata) \
{ \
  int n = 1280; \
  int fft_idx = get_local_id(0) + (get_group_id(0) % 4)*get_local_size(0); \
  if (inoffset == n) *((__global int *)userdata + get_global_id(0)) = 1; \
  float scalar = 0.5 - 0.5*cos(2*fft_idx*3.14159265358979/255); \
  return *((__global float*)input + inoffset) * scalar; \
}";

const char *postcallbackstr = "\
void post_fft( \
__global void *outputRe,  \
 __global void *outputIm,  \
 uint outoffset,           \
 __global void *userdata,  \
float fftoutputRe,         \
float fftoutputIm)         \
{ \
  *((__global float*)outputRe + outoffset) = fftoutputRe; \
}";

int add(int i, int j) {
    return i + j;
}

void f(pybind11::array_t<double, pybind11::array::c_style | pybind11::array::forcecast> array) {
    for (auto item : array)
        std::cout << item << " ";
    std::cout << std::endl;

    double *array_ptr = (double *)array.request().ptr;
    for (int i = 0; i < array.size(); i++)
        std::cout << array_ptr[i] << " ";
    std::cout << std::endl;

}

pybind11::array_t<std::complex<float>> spectro(pybind11::array_t<float, pybind11::array::c_style | pybind11::array::forcecast> audioData, int sampleRate)
{
    // Get pointer to data
    float *audioDataPtr = (float *)audioData.request().ptr;
    size_t N = audioData.size();

    //size_t fft_len = sampleRate * 20 * 0.001; // 20 ms interval

    size_t fft_len = 256;
    size_t in_strides[2] = {1, fft_len};
    size_t out_strides[2] = {1, fft_len/2 + 1};
    //size_t in_strides[2] = {1, fft_len/2};
    //size_t out_strides[2] = {1, fft_len};
    size_t num_ffts = N/(fft_len/2) - 1;

    /* OpenCL setup */
    cl_int err;
    cl_platform_id platform = 0;
    cl_device_id device = 0;
    cl_context_properties props[3] = {CL_CONTEXT_PLATFORM, 0, 0};
    cl_context ctx = 0;
    cl_command_queue queue = 0;

    err = clGetPlatformIDs(1, &platform, NULL);
    err = clGetDeviceIDs(platform, CL_DEVICE_TYPE_GPU, 1, &device, NULL);

    props[1] = (cl_context_properties)platform;
    ctx = clCreateContext(props, 1, &device, NULL, NULL, &err);
    queue = clCreateCommandQueue(ctx, device, 0, &err);

    /* clFFT setup */
    clfftSetupData fftSetup;
    clfftPlanHandle planHandle, offsetPlanHandle;
    clfftDim dim = CLFFT_1D; // Probably needs to be 2d
    //size_t *clLengths = (size_t *)audioData.shape();
    size_t clLengths[1] = {fft_len};
    size_t lengths[1] = {1};

    err = clfftInitSetupData(&fftSetup);
    err = clfftSetup(&fftSetup);

    int h_postuserdata[2] = {(int)fft_len, 0};
    int h_postuserdata_offset[2] = {(int)fft_len, (int)fft_len/2};
    cl_mem postuserdata = clCreateBuffer(ctx, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, 2*sizeof(int), h_postuserdata, NULL);
    cl_mem postuserdata_offset = clCreateBuffer(ctx, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, 2*sizeof(int), h_postuserdata_offset, NULL);

    /* FFT plan */
    err = clfftCreateDefaultPlan(&planHandle, ctx, dim, clLengths);
    err = clfftSetPlanPrecision(planHandle, CLFFT_SINGLE);
    err = clfftSetResultLocation(planHandle, CLFFT_OUTOFPLACE);
    err = clfftSetLayout(planHandle, CLFFT_REAL, CLFFT_HERMITIAN_INTERLEAVED);
    err = clfftSetPlanDistance(planHandle, fft_len, 2*(1 + fft_len/2));
    err = clfftSetPlanInStride(planHandle, CLFFT_2D, in_strides);
    err = clfftSetPlanOutStride(planHandle, CLFFT_2D, out_strides);
    //err = clfftSetPlanDistance(planHandle, fft_len/2, 1 + fft_len/2);
    //err = clfftSetPlanInStride(planHandle, CLFFT_2D, in_strides);
    //err = clfftSetPlanOutStride(planHandle, CLFFT_2D, out_strides);
    err = clfftSetPlanBatchSize(planHandle, num_ffts/2);

    //err = clfftSetPlanCallback(planHandle, "post_fft", postcallbackstr, 0, POSTCALLBACK, NULL, 1);
    err = clfftSetPlanCallback(planHandle, "pre_fft_off", precallbackstr_off, 0, PRECALLBACK, &postuserdata, 1);


    err = clfftBakePlan(planHandle, 1, &queue, NULL, NULL);

    err = clfftCopyPlan(&offsetPlanHandle, ctx, planHandle);
    err = clfftSetPlanCallback(offsetPlanHandle, "pre_fft_off", precallbackstr_off, 0, PRECALLBACK, &postuserdata_offset, 1);
    err = clfftSetPlanCallback(offsetPlanHandle, "post_fft_off", post_off, 0, POSTCALLBACK, &postuserdata_offset, 1);

    err = clfftBakePlan(offsetPlanHandle, 1, &queue, NULL, NULL);

    /* Data setup and execution of the plan */
    cl_mem bufX;
    cl_mem bufOut;
    bufX = clCreateBuffer(ctx, CL_MEM_READ_WRITE, N*sizeof(*audioDataPtr), NULL, &err);
    bufOut = clCreateBuffer(ctx, CL_MEM_READ_WRITE, 2*(1 + fft_len/2)*num_ffts*sizeof(*audioDataPtr), NULL, &err);

    std::complex<float> *specOut = (std::complex<float> *)malloc((1 + fft_len/2)*num_ffts*sizeof(std::complex<float>));

    err = clEnqueueWriteBuffer(queue, bufX, CL_TRUE, 0, N*sizeof(*audioDataPtr), audioDataPtr, 0, NULL, NULL);
    if (err)
        std::cout << "Enqueue don't work" << std::endl;
    //err = clEnqueueWriteBuffer(queue, bufX, CL_TRUE, 0, N*sizeof(*batchAudioDataPtr), batchAudioDataPtr, 0, NULL, NULL);

    err = clfftEnqueueTransform(planHandle, CLFFT_FORWARD, 1, &queue, 0, NULL, NULL, &bufX, &bufOut, NULL);
    err = clfftEnqueueTransform(offsetPlanHandle, CLFFT_FORWARD, 1, &queue, 0, NULL, NULL, &bufX, &bufOut, NULL);
    err = clFinish(queue);


    /* Get the data */
    err = clEnqueueReadBuffer(queue, bufOut, CL_TRUE, 0, (1 + fft_len/2)*num_ffts*sizeof(*specOut), specOut, 0, NULL, NULL);

    pybind11::array_t<std::complex<float>> retVal = pybind11::array_t<std::complex<float>>((1 + fft_len/2)*num_ffts, specOut);
    retVal.resize({num_ffts, 1 + fft_len/2});

    /* Cleanup data stuff */
    clReleaseMemObject(bufX);
    clReleaseMemObject(bufOut);

    free(specOut);

    /* clFFT teardown */
    clfftTeardown();

    /* OpenCL teardown */
    clReleaseCommandQueue(queue);
    clReleaseContext(ctx);

    return retVal;
}

PYBIND11_MODULE(cmake_test, m) {
    m.doc() = "pybind11 example plugin"; // optional module docstring

    m.def("add", &add, "A function which adds two numbers");

    m.def("f", &f, "Test numpy arrays");

    m.def("spectro", &spectro, pybind11::return_value_policy::copy, "Do spectrogram of input data");

    pybind11::class_<Spectrogram>(m, "Spectrogram")
        .def(pybind11::init())
        .def("RunFFT", &Spectrogram::RunFFT);
}

