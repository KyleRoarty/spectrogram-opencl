import numpy as np
from build.cmake_test import spectro,Spectrogram
from PIL import Image
import librosa

audiodata, samplerate = librosa.load(r"/home/kyle/Music/01ImaKoko.flac", mono=True)

spec = Spectrogram()
fft_len = 8 * 1024
overlap = 8 * 1024 - 256
otherdata = spec.RunFFT(audiodata, fft_len, overlap)

l = 1.0 - 1.0/(1.0 + np.absolute(otherdata)**0.3)

Image.fromarray((255*l).astype(np.uint8), mode="L").save('test4.tif')