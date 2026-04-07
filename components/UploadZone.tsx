"use client";

import { useCallback, useState, useRef } from "react";

interface UploadZoneProps {
  label: string;
  onFile: (file: File) => void;
  analyzing: boolean;
  fileName: string | null;
}

export default function UploadZone({
  label,
  onFile,
  analyzing,
  fileName,
}: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("audio/")) {
        onFile(file);
      }
    },
    [onFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-3
        rounded-xl border-2 border-dashed p-8 cursor-pointer
        transition-all duration-200 min-h-[200px]
        ${
          dragOver
            ? "border-violet-400 bg-violet-500/10"
            : fileName
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
      />

      {analyzing ? (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          <p className="text-sm text-zinc-400">Analyzing...</p>
        </>
      ) : fileName ? (
        <>
          <div className="text-2xl">✓</div>
          <p className="text-sm font-medium text-emerald-400">{fileName}</p>
          <p className="text-xs text-zinc-500">Click to replace</p>
        </>
      ) : (
        <>
          <div className="text-3xl text-zinc-600">♪</div>
          <p className="text-sm font-medium text-zinc-300">{label}</p>
          <p className="text-xs text-zinc-500">
            Drop an audio file or click to browse
          </p>
        </>
      )}
    </div>
  );
}
