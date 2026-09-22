"use client";

import { useState } from "react";
import { PromoCodeRecord } from "./PromoTable";

interface PromoEditModalProps {
  promo: PromoCodeRecord;
  onClose: () => void;
  onSaved: (updated: PromoCodeRecord) => void;
}

export default function PromoEditModal({ promo, onClose, onSaved }: PromoEditModalProps) {
  const [form, setForm] = useState({
    code: promo.code,
    description: promo.description ?? "",
    discountType: promo.discountType,
    discountValue: String(promo.discountValue),
    minOrderValue: String(promo.minOrderValue ?? 0),
    maxUses: String(promo.maxUses ?? 0),
    expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 10) : "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.code.trim()) return setError("code is required");
    if (!form.discountValue || Number(form.discountValue) <= 0)
      return setError("discount value must be greater than 0");

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/promo/${promo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
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
        setError(data.message ?? "failed to update promo code");
        return;
      }

      onSaved(data.data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-lg">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Edit Promo Code</h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
            <input
              value={form.code}
              onChange={(e) => update("code", e.target.value.toUpperCase())}
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Min order value (₹)</label>
            <input
              type="number"
              value={form.minOrderValue}
              onChange={(e) => update("minOrderValue", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Max uses</label>
            <input
              type="number"
              value={form.maxUses}
              onChange={(e) => update("maxUses", e.target.value)}
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

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Description (internal note)
            </label>
            <input
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-md px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="rounded-md bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/80 disabled:opacity-50"
          >
            {submitting ? "saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}