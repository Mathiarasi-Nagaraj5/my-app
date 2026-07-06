"use client";

import { X } from "lucide-react";

const SIZE_CHART = [
  { size: "S", chest: "38-40", length: "27" },
  { size: "M", chest: "41-43", length: "28" },
  { size: "L", chest: "44-46", length: "29" },
  { size: "XL", chest: "47-49", length: "30" },
  { size: "XXL", chest: "50-52", length: "31" },
];

export default function SizeGuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card bg-ivory p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-charcoal">
            size chart
          </h3>
          <button aria-label="Close" onClick={onClose}>
            <X size={18} className="text-charcoal" />
          </button>
        </div>
        <p className="mb-3 text-xs text-charcoal/55">all measurements in inches</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal/20 text-left text-charcoal/60">
              <th className="py-2">size</th>
              <th className="py-2">chest</th>
              <th className="py-2">length</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((row) => (
              <tr key={row.size} className="border-b border-charcoal/10 text-charcoal">
                <td className="py-2 font-medium">{row.size}</td>
                <td className="py-2">{row.chest}</td>
                <td className="py-2">{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}