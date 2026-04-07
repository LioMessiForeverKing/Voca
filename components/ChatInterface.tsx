"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AudioAnalysis } from "@/lib/types";
import { buildSystemPrompt } from "@/lib/buildSystemPrompt";
import MessageBubble from "./MessageBubble";
import QuickPrompts from "./QuickPrompts";

interface ChatInterfaceProps {
  sessionId: Id<"sessions">;
  vocalAnalysis: AudioAnalysis | null;
  trackAnalysis: AudioAnalysis | null;
}

export default function ChatInterface({
  sessionId,
  vocalAnalysis,
  trackAnalysis,
}: ChatInterfaceProps) {
  const messages = useQuery(api.messages.listMessages, { sessionId });
  const addMessage = useMutation(api.messages.addMessage);

  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, streamingContent]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setInput("");
      setIsStreaming(true);
      setStreamingContent("");

      // Save user message to Convex
      await addMessage({ sessionId, role: "user", content: content.trim() });

      // Build message history for the API
      const history = (messages ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      history.push({ role: "user", content: content.trim() });

      const systemPrompt = buildSystemPrompt(vocalAnalysis, trackAnalysis);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, systemPrompt }),
        });

        if (!response.ok) {
          throw new Error("Chat request failed");
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value);
          setStreamingContent(fullText);
        }

        // Save assistant response to Convex
        await addMessage({ sessionId, role: "assistant", content: fullText });
        setStreamingContent("");
      } catch {
        setStreamingContent("");
        await addMessage({
          sessionId,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [sessionId, messages, addMessage, vocalAnalysis, trackAnalysis, isStreaming]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const isEmpty = !messages?.length && !streamingContent;

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll p-4 space-y-3">
        {isEmpty && <QuickPrompts onSelect={sendMessage} />}

        {messages?.map((msg) => (
          <MessageBubble
            key={msg._id}
            role={msg.role}
            content={msg.content}
          />
        ))}

        {streamingContent && (
          <MessageBubble role="assistant" content={streamingContent} />
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-zinc-800 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.15s]" />
                <span className="h-2 w-2 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your mix..."
            disabled={isStreaming}
            className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3
                       text-sm text-zinc-200 placeholder-zinc-500
                       focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/25
                       disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white
                       transition-colors hover:bg-violet-500
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
