"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";

export default function CompleteProfileContent() {
  const { updateProfile, refresh } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      setError("enter a valid 10-digit phone number");
      return;
    }

    setSaving(true);
    const result = await updateProfile({ phone });
    setSaving(false);

    if (!result.ok) {
      setError(result.message ?? "failed to save phone number");
      return;
    }

    await refresh();
    router.push(next);
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-2 font-serif text-2xl font-medium text-charcoal">One more step</h1>
      <p className="mb-6 text-sm text-charcoal/60">
        Add your phone number so we can reach you about your orders.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="tel"
          placeholder="phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border border-charcoal/20 px-3 py-2 text-sm"
          required
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-pink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}