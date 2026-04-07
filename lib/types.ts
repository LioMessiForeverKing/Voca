export type Band = {
  name: string;
  low: number;
  high: number;
  pct: number;
};

export type AudioAnalysis = {
  fileName: string;
  duration: number;
  sampleRate: number;
  rmsDb: number;
  peakDb: number;
  dynamicRange: number;
  bands: Band[];
};

export const BANDS: Omit<Band, "pct">[] = [
  { name: "Sub", low: 30, high: 80 },
  { name: "Bass", low: 80, high: 250 },
  { name: "Lo-mid", low: 250, high: 800 },
  { name: "Mid", low: 800, high: 3000 },
  { name: "Hi-mid", low: 3000, high: 8000 },
  { name: "Highs", low: 8000, high: 20000 },
];
