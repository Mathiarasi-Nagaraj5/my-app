"use client";

import { ShopFilters } from "../../lib/types";

const ALL_CATEGORIES = ["t-shirts", "hoodies", "pyjamas"];
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];
const ALL_COLORS = ["#1C1B19", "#F3EFE7", "#6B5B45"];

interface FilterSidebarProps {
  filters: ShopFilters;
  onChange: (next: ShopFilters) => void;
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const toggleSize = (size: string) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes: next });
  };

  const toggleColor = (color: string) => {
    const next = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onChange({ ...filters, colors: next });
  };

  return (
    <aside className="w-full text-sm">
      {/* category */}
      <div className="border-b border-charcoal/15 pb-5">
        <p className="mb-3 font-medium text-charcoal">category</p>
        <div className="flex flex-col gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 text-charcoal/75"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-brass"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* price */}
      <div className="border-b border-charcoal/15 py-5">
        <p className="mb-3 font-medium text-charcoal">price</p>
        <input
          type="range"
          min={500}
          max={3000}
          step={100}
          value={filters.maxPrice}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-brass"
        />
        <div className="flex justify-between text-xs text-charcoal/55">
          <span>₹500</span>
          <span>up to ₹{filters.maxPrice.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* size */}
      <div className="border-b border-charcoal/15 py-5">
        <p className="mb-3 font-medium text-charcoal">size</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`flex h-8 w-8 items-center justify-center rounded border text-xs ${
                  active
                    ? "border-brass text-brass font-medium"
                    : "border-charcoal/40 text-charcoal/70"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* color */}
      <div className="pt-5">
        <p className="mb-3 font-medium text-charcoal">color</p>
        <div className="flex gap-2">
          {ALL_COLORS.map((color) => {
            const active = filters.colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                aria-label={`Filter by color ${color}`}
                onClick={() => toggleColor(color)}
                style={{ backgroundColor: color }}
                className={`h-6 w-6 rounded-full border-2 ${
                  active ? "border-brass" : "border-charcoal/20"
                }`}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}