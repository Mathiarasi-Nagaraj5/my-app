"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {  MessageSquareText, X } from 'lucide-react';

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
}

interface ChatResponse {
  text: string;
}

const QUICK_REPLIES: string[] = [
  "Track my order",
  "Size guide",
  "Return policy",
  "Delivery time",
];

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! 👋 I'm the Elite Soul assistant. Ask me about sizes, delivery, returns or your order.",
};

// Turns plain URLs in bot replies into clickable links
function renderText(text: string): ReactNode[] {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    part.startsWith("http") ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-pink"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text?: string): Promise<void> {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // skip the welcome message, send last 10 only
        body: JSON.stringify({ messages: next.slice(1).slice(-10) }),
      });
      if (!res.ok) throw new Error("Request failed");

      const data = (await res.json()) as ChatResponse;
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again or email elitesoul25@gmail.com.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    void send();
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Elite Soul chat"
          className="fixed bottom-24 right-5 z-[9999] flex h-[520px] max-h-[calc(100dvh-110px)] w-[360px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl bg-white font-sans text-charcoal shadow-2xl ring-1 ring-charcoal/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-charcoal px-4 py-3.5 text-ivory">
            <div className="flex flex-col">
              <strong className="font-serif text-lg font-medium leading-tight">
                Elite Soul Assistant
              </strong>
              <span className="text-xs text-ivory/70">
                Usually replies instantly
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-lg text-ivory/80 transition hover:text-pink"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-ivory p-3.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "max-w-[82%] self-end whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-charcoal px-3.5 py-2.5 text-sm leading-relaxed text-ivory"
                    : "max-w-[82%] self-start whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed text-charcoal shadow-sm"
                }
              >
                {renderText(m.content)}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void send(q)}
                    className="rounded-full border border-charcoal/20 bg-white px-3 py-1.5 text-[13px] text-charcoal transition hover:border-pink hover:text-pink"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div
                className="flex w-fit gap-1 self-start rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 shadow-sm"
                aria-label="Assistant is typing"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-charcoal/40"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-charcoal/10 bg-white p-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              maxLength={500}
              className="flex-1 rounded-full border border-charcoal/20 bg-white px-4 py-2 text-sm text-charcoal outline-none placeholder:text-charcoal/40 focus:border-pink"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-full bg-pink px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>
        </div>
      )}

    
   {/* Floating button */}
<button
  type="button"
  onClick={() => setOpen((o) => !o)}
  aria-label={open ? "Close chat" : "Open chat"}
  className="fixed bottom-5 right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-pink text-black shadow-xl transition-transform hover:scale-105"
>
  {/* Ripple rings (only while the chat is closed) */}
  {!open && (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-pink/70 border-2 border-ivory animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-pink  animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_1.4s_infinite]"
      />
    </>
  )}

  {/* Icon */}
    {open ? (<X className="h-6 w-6" />) : (<MessageSquareText className="h-6 w-6 text-white" />)}
  {/* Online dot */}
  {!open && (
    <span
      aria-hidden="true"
      className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-ivory bg-green-500"
    />
  )}
</button>
    </>
  );
}