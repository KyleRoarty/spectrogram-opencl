import soundfile as sf
import numpy as np
import matplotlib.pyplot as plot
import matplotlib.mlab as lab
import scipy.signal as sp
import scipy.fft as sfft
from build.cmake_test import spectro

audiodata, samplerate = sf.read('/home/kyle/Music/test.flac', dtype='float32')

otherdata = spectro(audiodata, samplerate)

#actualdata = np.zeros(129*10334, dtype='complex').reshape(10334,129)
#
#otherdata = np.square(otherdata)
#
#for i in range(1, 10333):
#    actualdata[i] = np.sqrt(np.mean(otherdata[i-1:i+2],0))
#
#actualdata = actualdata.transpose()

actualdata = otherdata.transpose()

plot.title('Spectrogram of flac file')

han = np.hanning(256)
a = np.zeros(129*10334, dtype='complex').reshape(10334,129)
b = np.zeros(129*10334).reshape(10334,129)

S1 = sum(han)
S1 = sum(np.square(han))

#for i in range(0,10334):
#    a[i] = np.fft.rfft((audiodata[i*128:(i+2)*128],han))
nperseg=256
noverlap=128
step = nperseg - noverlap
shape = audiodata.shape[:-1]+((audiodata.shape[-1]-noverlap)//step, nperseg)
strides = audiodata.strides[:-1]+(step*audiodata.strides[-1], audiodata.strides[-1])
result = np.lib.stride_tricks.as_strided(audiodata, shape=shape,
                                                 strides=strides)

#a = sfft.rfft(result, 256)
#a = np.fft.rfft(result[0:10334], 256)
n = int(1)
for i in range(0, int(10334/n), n):
    a[i:i+n] = sfft.rfft(result[i:i+n], 256)

#for i in range(1, 10333):
#    b[i] = np.mean(a[i-1:i+2], 0)
b = a
b = b.transpose()

#frequ, times, spectr = sp.spectrogram(audiodata, samplerate, window='hann', nperseg=256, noverlap=128, mode='magnitude')
frequ, times, spectr = sp.spectrogram(audiodata, samplerate, window=np.ones(256), nperseg=256, noverlap=128, mode='magnitude', detrend=False, scaling='density')


plot.subplot(411)
powerSpectrum, frequenciesFound, time, imageAxis = plot.specgram(audiodata, Fs=samplerate, filternorm=False, interpolation='none')
plot.xlabel('Time')
plot.ylabel('Frequency')

plot.subplot(412)
powerSpectrum2, frequenciesFound2, time2, imageAxis = plot.specgram(audiodata, Fs=samplerate, window=lab.window_none, filternorm=False, interpolation='none')
plot.pcolormesh(time2, frequenciesFound2, 10 * np.log10(np.absolute(b)))

plot.subplot(413)
plot.pcolormesh(times, frequ, 10 * np.log10(np.absolute(spectr)))

plot.subplot(414)
plot.pcolormesh(time, frequenciesFound, 10 * np.log10(np.absolute(actualdata)))
plot.axis('tight')
plot.xlabel('Time')
plot.ylabel('Frequency')

plot.show()
