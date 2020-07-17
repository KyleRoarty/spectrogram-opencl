#ifndef __WINDOW_HH__
#define __WINDOW_HH__

#include <clFFT.h>

namespace Window {
    const char *hann = "\
float hann( \
__global void *input, \
uint inoffset, \
__global void *userdata) \
{ \
  int fft_len = *(__global int *)userdata; \
  int fft_offset = *((__global int *)userdata + 1); \
  int fft_idx = inoffset % fft_len; \
  float scalar = 0.5 - 0.5*cos(M_PI_F*2*fft_idx/(fft_len - 1)); \
  return *((__global float*)input + inoffset + fft_offset) * scalar; \
}";

    const char *none = "\
float none( \
__global void *input, \
uint inoffset, \
__global void *userdata) \
{ \
  int fft_offset = *((__global int *)userdata + 1); \
  return *((__global float*)input + inoffset + fft_offset); \
}";

    const char *post_offset = "\
void post_offset( \
__global void *output, \
uint outoffset, \
__global void *userdata, \
float2 fftoutput) \
{ \
  int fft_offset = *((__global int *)userdata + 1); \
  *((__global float2 *)output + outoffset + fft_offset + 1) = fftoutput; \
}";

}

#endif
