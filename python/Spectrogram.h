#ifndef __SPECTROGRAM_HH__
#define __SPECTROGRAM_HH__

#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>
#include <pybind11/stl.h>
#include <stdlib.h>

#include <clFFT.h>

namespace py = pybind11;

class Spectrogram
{
  public:
    Spectrogram();
    ~Spectrogram();
    py::array_t<std::complex<float>> RunFFT(
        py::array_t<float, py::array::c_style | py::array::forcecast> inSamples,
        size_t fft_len,
        size_t num_overlap);

  private:
    // OpenCL variables
    cl_platform_id platform;
    cl_device_id device;
    cl_context_properties props[3];
    cl_context ctx;
    cl_command_queue queue;

    // clFFT variables
    clfftSetupData fftSetup;
};

#endif
