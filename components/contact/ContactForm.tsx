"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { INQUIRY_TYPES } from "../../app/lib/contactTypes";
import type { InquiryType } from "../../app/lib/contactTypes";

interface FormState {
  name: string;
  email: string;
  inquiryType: InquiryType;
  message: string;
  website: string;
}

type Status = "idle" | "sending" | "success" | "error";

const INITIAL: FormState = {
  name: "",
  email: "",
  inquiryType: INQUIRY_TYPES[0],
  message: "",
  website: "",
};

const LABEL =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal/70";
const FIELD =
  "w-full border border-charcoal/10 bg-ivory px-5 py-3 text-sm text-charcoal shadow-sm outline-none transition placeholder:text-charcoal/40 focus:border-pink";

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setForm(INITIAL);
      setStatus("success");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <p className="font-serif text-2xl uppercase tracking-wide">Thank you!</p>
        <p className="mt-3 max-w-xs text-sm text-charcoal/65">
          Your message has reached us. We&apos;ll reply to your email soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-pink underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL}>
            Your name
          </label>
          <input
            id="name"
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Enter your name"
            className={`${FIELD} rounded-full`}
          />
        </div>
        <div>
          <label htmlFor="email" className={LABEL}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Enter your email address"
            className={`${FIELD} rounded-full`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="inquiryType" className={LABEL}>
          Inquiry type
        </label>
        <div className="relative">
          <select
            id="inquiryType"
            value={form.inquiryType}
            onChange={(e) => update("inquiryType", e.target.value as InquiryType)}
            className={`${FIELD} appearance-none rounded-full pr-11`}
          >
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-charcoal/60"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={LABEL}>
          Message
        </label>
        <textarea
          id="message"
          required
          rows={4}
          maxLength={2000}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="How can we help?"
          className={`${FIELD} resize-none rounded-3xl`}
        />
      </div>

      {/* honeypot: hidden from real users */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={(e) => update("website", e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-pink py-4 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}