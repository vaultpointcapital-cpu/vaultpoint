"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "aria";
  content: string;
};

export default function AriaChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/aria/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setMessages((prev) => [...prev, { role: "aria", content: data.reply }]);
    } catch {
      setError("Could not reach Aria. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[16px] border border-[#1E2330] bg-[#111318] p-6">
      <p className="border-b border-[#1E2330] pb-3 text-[11px] font-medium uppercase tracking-widest text-[#4A5168]">
        Ask Aria
      </p>

      <div className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-[13px] text-[#4A5168]">
            Ask about your account, positions, or a quick market read.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "self-end rounded-[12px] bg-[#6C63FF] px-3.5 py-2 text-[14px] text-white"
                : "self-start rounded-[12px] bg-[#0A0C10] px-3.5 py-2 text-[14px] text-[#F0F2F8]"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <p className="self-start text-[13px] text-[#4A5168]">
            Aria is thinking...
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 text-[13px] text-[#FF6B35]">{error}</p>
      )}

      <div className="mt-4 flex gap-2">
        <input
          className="w-full rounded-[12px] border border-[#1E2330] bg-[#0A0C10] px-3.5 py-2.5 text-[15px] text-[#F0F2F8] placeholder:text-[#4A5168] outline-none transition-colors focus:border-[#6C63FF]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask Aria something..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="cursor-pointer rounded-[12px] bg-[#6C63FF] px-4 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}