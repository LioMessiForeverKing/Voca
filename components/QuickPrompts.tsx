"use client";

const QUICK_PROMPTS = [
  "Where should I start with my vocals?",
  "Why do my vocals sound thin or weak?",
  "How do I make my voice cut through the mix?",
  "My vocals feel buried — what do I do?",
  "What should I do about the low-end on my vocal?",
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-8">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-zinc-700 bg-zinc-800/50 px-4 py-2
                     text-sm text-zinc-300 transition-colors
                     hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-300"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
