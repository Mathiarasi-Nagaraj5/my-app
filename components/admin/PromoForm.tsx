"use client";

import { useState } from "react";
import { PromoCodeRecord } from "./PromoTable";

interface PromoFormProps {
  onCreated: (promo: PromoCodeRecord) => void;
}

const initialState = {
  code: "",
  description: "",
  discountType: "percentage" as "percentage" | "flat",
  discountValue: "",
  minOrderValue: "",
  maxUses: "",
  expiresAt: "",
};

export default function PromoForm({ onCreated }: PromoFormProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof typeof initialState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.code.trim()) return setError("code is required");
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return setError("discount value must be greater than 0");

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          description: form.description.trim(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
          maxUses: form.maxUses ? Number(form.maxUses) : 0,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "failed to create promo code");
        return;
      }

      onCreated(data.data);
      setForm(initialState);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        + New Promo Code
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
          <input
            value={form.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            placeholder="SUMMER20"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Discount type</label>
          <select
            value={form.discountType}
            onChange={(e) => update("discountType", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Discount value {form.discountType === "percentage" ? "(%)" : "(₹)"}
          </label>
          <input
            type="number"
            value={form.discountValue}
            onChange={(e) => update("discountValue", e.target.value)}
            placeholder={form.discountType === "percentage" ? "20" : "100"}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Min order value (₹)</label>
          <input
            type="number"
            value={form.minOrderValue}
            onChange={(e) => update("minOrderValue", e.target.value)}
            placeholder="0 = no minimum"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Max uses</label>
          <input
            type="number"
            value={form.maxUses}
            onChange={(e) => update("maxUses", e.target.value)}
            placeholder="0 = unlimited"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Expires on</label>
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => update("expiresAt", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Description (internal note)
          </label>
          <input
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="20% off summer sale"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "creating..." : "Create Promo Code"}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setForm(initialState);
            setError("");
          }}
          className="rounded-md px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}