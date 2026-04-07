"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AudioAnalysis } from "@/lib/types";
import SpectrumDisplay from "@/components/SpectrumDisplay";
import ChatInterface from "@/components/ChatInterface";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as Id<"sessions">;
  const session = useQuery(api.sessions.getSession, { id: sessionId });

  if (session === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-zinc-400">Session not found.</p>
      </div>
    );
  }

  const vocal = (session.vocalAnalysis as AudioAnalysis) ?? null;
  const track = (session.trackAnalysis as AudioAnalysis) ?? null;

  return (
    <div className="flex h-screen flex-col">
      {/* Header + spectrum */}
      <div className="border-b border-zinc-800 p-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-3 text-lg font-semibold text-white">
            Vocal Coach AI
          </h1>
          {(vocal || track) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vocal && <SpectrumDisplay label="Vocal" analysis={vocal} />}
              {track && (
                <SpectrumDisplay label="Backing Track" analysis={track} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex flex-1 flex-col min-h-0 mx-auto w-full max-w-4xl">
        <ChatInterface
          sessionId={sessionId}
          vocalAnalysis={vocal}
          trackAnalysis={track}
        />
      </div>
    </div>
  );
}
