import { fft } from "./fft";
import { AudioAnalysis, BANDS } from "./types";

const FFT_SIZE = 8192;

/**
 * Analyzes an audio file entirely in the browser.
 * Audio never leaves the client — only the numeric analysis is sent to Convex.
 */
export async function analyzeAudio(file: File): Promise<AudioAnalysis> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const samples = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // RMS and peak from the full signal
  let sumSquares = 0;
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    sumSquares += s * s;
    const abs = Math.abs(s);
    if (abs > peak) peak = abs;
  }
  const rms = Math.sqrt(sumSquares / samples.length);
  const rmsDb = 20 * Math.log10(rms || 1e-10);
  const peakDb = 20 * Math.log10(peak || 1e-10);
  const dynamicRange = peakDb - rmsDb;

  // Extract center segment, apply Hanning window, run FFT
  const center = Math.floor(samples.length / 2);
  const start = Math.max(0, center - FFT_SIZE / 2);
  const re = new Float64Array(FFT_SIZE);
  const im = new Float64Array(FFT_SIZE);

  for (let i = 0; i < FFT_SIZE; i++) {
    const idx = start + i;
    const sample = idx < samples.length ? samples[idx] : 0;
    const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)));
    re[i] = sample * window;
  }

  fft(re, im);

  // Magnitude spectrum (first half only — symmetric for real input)
  const magnitudes = new Float64Array(FFT_SIZE / 2);
  for (let i = 0; i < FFT_SIZE / 2; i++) {
    magnitudes[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
  }

  // Energy per band
  const bandEnergies = BANDS.map((band) => {
    const lowBin = Math.floor((band.low * FFT_SIZE) / sampleRate);
    const highBin = Math.min(
      Math.ceil((band.high * FFT_SIZE) / sampleRate),
      FFT_SIZE / 2 - 1
    );
    let energy = 0;
    for (let i = lowBin; i <= highBin; i++) {
      energy += magnitudes[i] * magnitudes[i];
    }
    return { ...band, energy };
  });

  const totalEnergy = bandEnergies.reduce((sum, b) => sum + b.energy, 0);
  const bands = bandEnergies.map((b) => ({
    name: b.name,
    low: b.low,
    high: b.high,
    pct: totalEnergy > 0 ? Math.round((b.energy / totalEnergy) * 100) : 0,
  }));

  await audioContext.close();

  return {
    fileName: file.name,
    duration: Math.round(duration * 10) / 10,
    sampleRate,
    rmsDb: Math.round(rmsDb * 10) / 10,
    peakDb: Math.round(peakDb * 10) / 10,
    dynamicRange: Math.round(dynamicRange * 10) / 10,
    bands,
  };
}
