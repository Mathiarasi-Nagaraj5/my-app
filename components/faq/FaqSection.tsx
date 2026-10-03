"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { FAQ_CATEGORIES } from "@/app/lib/faqData";

export default function FaqSection() {
  const [activeId, setActiveId] = useState<string>(FAQ_CATEGORIES[0].id);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const active =
    FAQ_CATEGORIES.find((c) => c.id === activeId) ?? FAQ_CATEGORIES[0];

  function selectCategory(id: string): void {
    setActiveId(id);
    setOpenIndex(0);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* category pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {FAQ_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCategory(c.id)}
            aria-pressed={c.id === activeId}
            className={
              c.id === activeId
                ? "rounded-full bg-pink px-4 py-2 text-xs font-semibold text-white"
                : "rounded-full border border-charcoal/15 bg-white px-4 py-2 text-xs font-semibold text-charcoal/70 transition hover:border-pink hover:text-pink"
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* category header */}
      <div className="mb-4 flex items-center justify-between border-b border-charcoal/10 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink/10">
            <Sparkles size={15} className="text-pink" />
          </span>
          <h2 className="font-serif text-xl font-semibold text-pink">
            {active.label}
          </h2>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-charcoal/40">
          {active.tag}
        </span>
      </div>

      {/* accordion */}
      <div className="space-y-3">
        {active.items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-sm"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-serif text-[17px] font-medium"
              >
                <span>
                  {i + 1}. {item.q}
                </span>
                <ChevronDown
                  size={17}
                  className={`shrink-0 text-pink transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="space-y-2 border-t border-charcoal/10 px-5 pb-5 pt-4 text-sm leading-relaxed text-charcoal/70">
                  {item.a.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}