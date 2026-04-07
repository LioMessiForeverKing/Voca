"use client";

import { AudioAnalysis } from "@/lib/types";

interface SpectrumDisplayProps {
  label: string;
  analysis: AudioAnalysis;
}

const BAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-cyan-500",
  "bg-blue-500",
];

export default function SpectrumDisplay({
  label,
  analysis,
}: SpectrumDisplayProps) {
  return (
    <div className="rounded-lg bg-zinc-900/80 border border-zinc-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">{label}</h3>
        <span className="text-xs text-zinc-500 truncate ml-2">
          {analysis.fileName}
        </span>
      </div>

      <div className="mb-3 flex gap-4 text-xs text-zinc-500">
        <span>RMS: {analysis.rmsDb} dB</span>
        <span>Peak: {analysis.peakDb} dB</span>
        <span>DR: {analysis.dynamicRange} dB</span>
        <span>{analysis.duration}s</span>
      </div>

      <div className="space-y-1.5">
        {analysis.bands.map((band, i) => (
          <div key={band.name} className="flex items-center gap-2">
            <span className="w-12 text-right text-xs text-zinc-500">
              {band.name}
            </span>
            <div className="flex-1 h-4 rounded-sm bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-sm ${BAR_COLORS[i]} transition-all duration-500`}
                style={{ width: `${band.pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-zinc-500">
              {band.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
