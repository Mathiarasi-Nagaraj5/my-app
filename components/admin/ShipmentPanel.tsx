"use client";

import { useState } from "react";
import { FileText, ClipboardList, PackageCheck, Loader2 } from "lucide-react";

interface ShipmentPanelProps {
  orderId: string;
  shipment?: {
    awbCode?: string;
    labelUrl?: string;
    manifestUrl?: string;
    pickupScheduledAt?: string;
  };
  onUpdated: (shipment: any) => void;
}

export default function ShipmentPanel({ orderId, shipment, onUpdated }: ShipmentPanelProps) {
  const [busy, setBusy] = useState<"label" | "manifest" | "pickup" | null>(null);
  const [error, setError] = useState("");

  if (!shipment?.awbCode) return null;

  const call = async (action: "label" | "manifest" | "pickup") => {
    setBusy(action);
    setError("");
    const endpoint =
      action === "label"
        ? "/api/shiprocket/generate-label"
        : action === "manifest"
        ? "/api/shiprocket/generate-manifest"
        : "/api/shiprocket/schedule-pickup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? `failed to ${action}`);
        return;
      }

      if (action === "label") onUpdated({ ...shipment, labelUrl: data.labelUrl });
      if (action === "manifest") onUpdated({ ...shipment, manifestUrl: data.manifestUrl });
      if (action === "pickup") onUpdated({ ...shipment, pickupScheduledAt: data.pickupScheduledAt });
    } catch {
      setError(`something went wrong while trying to ${action}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-charcoal/10 bg-charcoal/[0.015] px-4 py-2.5 text-xs">
      {shipment.labelUrl ? (
        <a
          href={shipment.labelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded border border-charcoal/20 px-2 py-1 text-charcoal/70 hover:border-brass hover:text-brass"
        >
          <FileText size={12} /> view label
        </a>
      ) : (
        <button
          onClick={() => call("label")}
          disabled={busy !== null}
          className="flex items-center gap-1 rounded border border-charcoal/20 px-2 py-1 text-charcoal/70 hover:border-brass hover:text-brass disabled:opacity-50"
        >
          {busy === "label" ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
          {busy === "label" ? "generating..." : "generate label"}
        </button>
      )}

      {shipment.manifestUrl ? (
        <a
          href={shipment.manifestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded border border-charcoal/20 px-2 py-1 text-charcoal/70 hover:border-brass hover:text-brass"
        >
          <ClipboardList size={12} /> view manifest
        </a>
      ) : (
        <button
          onClick={() => call("manifest")}
          disabled={busy !== null}
          className="flex items-center gap-1 rounded border border-charcoal/20 px-2 py-1 text-charcoal/70 hover:border-brass hover:text-brass disabled:opacity-50"
        >
          {busy === "manifest" ? <Loader2 size={12} className="animate-spin" /> : <ClipboardList size={12} />}
          {busy === "manifest" ? "generating..." : "generate manifest"}
        </button>
      )}

      {shipment.pickupScheduledAt ? (
        <span className="flex items-center gap-1 text-green-700">
          <PackageCheck size={12} /> pickup scheduled: {new Date(shipment.pickupScheduledAt).toLocaleDateString()}
        </span>
      ) : (
        <button
          onClick={() => call("pickup")}
          disabled={busy !== null}
          className="flex items-center gap-1 rounded border border-charcoal/20 px-2 py-1 text-charcoal/70 hover:border-brass hover:text-brass disabled:opacity-50"
        >
          {busy === "pickup" ? <Loader2 size={12} className="animate-spin" /> : <PackageCheck size={12} />}
          {busy === "pickup" ? "scheduling..." : "schedule pickup"}
        </button>
      )}

      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
}