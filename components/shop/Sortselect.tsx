"use client";

import { SortOption } from "../../app/lib/types";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Sort: featured" },
  { value: "price-low-high", label: "Price: low to high" },
  { value: "price-high-low", label: "Price: high to low" },
  { value: "newest", label: "Newest first" },
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
      className="h-10 rounded border border-charcoal bg-ivory px-3 text-sm text-charcoal focus:outline-none focus:ring-1 focus:ring-pink"
    >
      {OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}