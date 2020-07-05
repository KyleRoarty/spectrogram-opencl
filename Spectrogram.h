#ifndef __SPECTROGRAM_HH__
#define __SPECTROGRAM_HH__

#include <clFFT.h>

class Spectrogram
{
  public:
    Spectrogram();
    ~Spectrogram();
    void SetFFT();

  private:
    // OpenCL variables
    cl_platform_id platform;
    cl_device_id device;
    cl_context_properties props[3];
    cl_context ctx;
    cl_command_queue queue;

    // clFFT variables
    clfftSetupData fftSetup;
}

#endif
