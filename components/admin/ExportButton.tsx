"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type ExportType = "customers" | "orders" | "inventory";

export default function ExportButtons({ type, label }: { type: ExportType; label: string }) {
  const [format, setFormat] = useState<"csv" | "xlsx">("xlsx");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/export?type=${type}&format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as "csv" | "xlsx")}
        className="h-9 rounded border border-charcoal/25 bg-ivory px-2 text-sm"
      >
        <option value="xlsx">Excel (.xlsx)</option>
        <option value="csv">CSV</option>
      </select>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="flex h-9 items-center gap-1.5 rounded bg-charcoal px-4 text-sm text-ivory hover:bg-charcoal/90 disabled:opacity-50"
      >
        <Download size={14} /> {busy ? "preparing..." : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}