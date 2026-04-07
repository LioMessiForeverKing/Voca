"use client";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
          ${
            isUser
              ? "bg-violet-600 text-white rounded-br-md"
              : "bg-zinc-800 text-zinc-200 rounded-bl-md"
          }
        `}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}
