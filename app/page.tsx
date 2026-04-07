"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { analyzeAudio } from "@/lib/analyzeAudio";
import { AudioAnalysis } from "@/lib/types";
import UploadZone from "@/components/UploadZone";
import SpectrumDisplay from "@/components/SpectrumDisplay";

export default function Home() {
  const router = useRouter();
  const createSession = useMutation(api.sessions.createSession);
  const updateVocal = useMutation(api.sessions.updateVocalAnalysis);
  const updateTrack = useMutation(api.sessions.updateTrackAnalysis);

  const [vocalAnalysis, setVocalAnalysis] = useState<AudioAnalysis | null>(null);
  const [trackAnalysis, setTrackAnalysis] = useState<AudioAnalysis | null>(null);
  const [analyzingVocal, setAnalyzingVocal] = useState(false);
  const [analyzingTrack, setAnalyzingTrack] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleVocalFile = async (file: File) => {
    setAnalyzingVocal(true);
    try {
      const analysis = await analyzeAudio(file);
      setVocalAnalysis(analysis);
    } catch (err) {
      console.error("Vocal analysis failed:", err);
    } finally {
      setAnalyzingVocal(false);
    }
  };

  const handleTrackFile = async (file: File) => {
    setAnalyzingTrack(true);
    try {
      const analysis = await analyzeAudio(file);
      setTrackAnalysis(analysis);
    } catch (err) {
      console.error("Track analysis failed:", err);
    } finally {
      setAnalyzingTrack(false);
    }
  };

  const handleStart = async () => {
    if (!vocalAnalysis && !trackAnalysis) return;
    setStarting(true);

    try {
      const sessionId = await createSession();

      // Store analysis data in Convex
      if (vocalAnalysis) {
        await updateVocal({ id: sessionId, analysis: vocalAnalysis });
      }
      if (trackAnalysis) {
        await updateTrack({ id: sessionId, analysis: trackAnalysis });
      }

      router.push(`/session/${sessionId}`);
    } catch (err) {
      console.error("Failed to create session:", err);
      setStarting(false);
    }
  };

  const hasAudio = vocalAnalysis || trackAnalysis;
  const isAnalyzing = analyzingVocal || analyzingTrack;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Vocal Coach AI
          </h1>
          <p className="text-zinc-400 text-lg">
            Drop your stems. Get Logic Pro X mixing advice.
          </p>
          <p className="text-zinc-600 text-sm">
            Audio stays in your browser — only the analysis is stored.
          </p>
        </div>

        {/* Upload zones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UploadZone
            label="Vocal Stem"
            onFile={handleVocalFile}
            analyzing={analyzingVocal}
            fileName={vocalAnalysis?.fileName ?? null}
          />
          <UploadZone
            label="Backing Track"
            onFile={handleTrackFile}
            analyzing={analyzingTrack}
            fileName={trackAnalysis?.fileName ?? null}
          />
        </div>

        {/* Spectrum previews */}
        {hasAudio && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vocalAnalysis && (
              <SpectrumDisplay label="Vocal" analysis={vocalAnalysis} />
            )}
            {trackAnalysis && (
              <SpectrumDisplay label="Backing Track" analysis={trackAnalysis} />
            )}
          </div>
        )}

        {/* Start button */}
        <div className="flex justify-center">
          <button
            onClick={handleStart}
            disabled={!hasAudio || isAnalyzing || starting}
            className="rounded-xl bg-violet-600 px-8 py-3 text-base font-semibold text-white
                       transition-all hover:bg-violet-500 hover:scale-[1.02]
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {starting ? "Creating session..." : "Start Session"}
          </button>
        </div>
      </div>
    </main>
  );
}
