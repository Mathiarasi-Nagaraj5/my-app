"use client";

import { SortOption } from "../../lib/types";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "sort: featured" },
  { value: "price-low-high", label: "price: low to high" },
  { value: "price-high-low", label: "price: high to low" },
  { value: "newest", label: "newest first" },
];

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="h-10 rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-brass"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}