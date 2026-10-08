"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { MessageSquareText, X } from 'lucide-react';
import { matchIntent, BotReply } from "../chat/botTrain";   // adjust path
import { buildWhatsAppLink } from "@/app/lib/contact";
import { CONTACT_NUMBER } from "@/app/lib/contact";
import { usePathname } from "next/navigation";
interface ChatMessage {
  role: Role;
  content: string;
  link?: { label: string; href: string };
  suggestions?: string[];
}
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
    const pathname = usePathname();
  // Hide on admin pages (must come after all hooks)
  if (pathname?.startsWith("/admin")) return null;
const HIDDEN_ON = ["/admin", "/checkout", "/login"];

if (HIDDEN_ON.some((p) => pathname?.startsWith(p))) return null;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text?: string): Promise<void> {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setMessages((m) => [...m, { role: "user", content }]);
    setInput("");
    setLoading(true);

    // small delay so it feels like typing
    await new Promise((r) => setTimeout(r, 500));

    const result = matchIntent(content);
    let reply: BotReply;

    if ("search" in result) {
      reply = await searchProducts(result.search);
    } else {
      reply = result.reply;
    }

    // always offer WhatsApp when the bot is unsure or for contact/track/custom
    const needsWhatsApp = /whatsapp|not sure/i.test(reply.text);
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: reply.text,
        suggestions: reply.suggestions,
        link: reply.link ??
          (needsWhatsApp
            ? { label: "Chat on WhatsApp", href: buildWhatsAppLink("Hi! I need help with my order/product.", CONTACT_NUMBER) }
            : undefined),
      },
    ]);
    setLoading(false);
  }

  // Free product lookup using your existing products API
  async function searchProducts(query: string): Promise<BotReply> {
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      const words = query.split(" ").filter((w) => w.length > 2);
      const matches = (json.data ?? []).filter((p: any) =>
        words.some((w) =>
          `${p.name} ${(p.category ?? []).join(" ")} ${p.fit ?? ""} ${p.pattern ?? ""}`
            .toLowerCase()
            .includes(w)
        )
      );

      if (matches.length === 0) {
        return { text: "I couldn't find that product. You can browse everything in our shop.", link: { label: "Browse shop", href: "/shop" } };
      }
      const p = matches[0];
      return {
        text: `${p.name} is ₹${p.price}${p.originalPrice ? ` (was ₹${p.originalPrice})` : ""}. Sizes: ${(p.sizes ?? []).join(", ")}.${p.stock > 0 ? "" : " Currently out of stock."}`,
        link: { label: "View product", href: `/product/${p.slug}` },
      };
    } catch {
      return { text: "I couldn't check that right now. Please try the shop page.", link: { label: "Browse shop", href: "/shop" } };
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
              <div key={i} className={m.role === "user" ? "self-end max-w-[82%]" : "self-start max-w-[82%]"}>
                <div
                  className={
                    m.role === "user"
                      ? "whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-charcoal px-3.5 py-2.5 text-sm leading-relaxed text-ivory"
                      : "whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed text-charcoal shadow-sm"
                  }
                >
                  {renderText(m.content)}
                </div>

                {m.link && (
                  <a
                    href={m.link.href}
                    target={m.link.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block rounded-full bg-pink px-3.5 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
                  >
                    {m.link.label}
                  </a>
                )}

                {m.role === "assistant" && m.suggestions && i === messages.length - 1 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void send(s)}
                        className="rounded-full border border-charcoal/20 bg-white px-3 py-1.5 text-[13px] text-charcoal hover:border-pink hover:text-pink"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
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