"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface PincodeCheckProps {
  pincode: string;
  itemCount: number;
  cod: boolean;
  onServiceabilityChange: (serviceable: boolean | null) => void;
}

type CheckState = "idle" | "checking" | "serviceable" | "unserviceable" | "error";

export default function PincodeCheck({ pincode, itemCount, cod, onServiceabilityChange }: PincodeCheckProps) {
  const [state, setState] = useState<CheckState>("idle");

  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) {
      setState("idle");
      onServiceabilityChange(null);
      return;
    }

    let cancelled = false;
    setState("checking");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/shipping/serviceability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pincode, itemCount, cod }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok || !data.success) {
          setState("error");
          onServiceabilityChange(null);
          return;
        }

        setState(data.serviceable ? "serviceable" : "unserviceable");
        onServiceabilityChange(data.serviceable);
      } catch {
        if (!cancelled) {
          setState("error");
          onServiceabilityChange(null);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode, itemCount, cod]);

  if (state === "idle" || state === "error") return null;

  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs">
      {state === "checking" && (
        <>
          <Loader2 size={12} className="animate-spin text-charcoal/40" />
          <span className="text-charcoal/50">checking delivery availability...</span>
        </>
      )}
      {state === "serviceable" && (
        <>
          <CheckCircle2 size={12} className="text-green-500" />
          <span className="text-green-700">delivery available to this pincode</span>
        </>
      )}
      {state === "unserviceable" && (
        <>
          <XCircle size={12} className="text-red-500" />
          <span className="text-red-600">sorry, we don&apos;t deliver to this pincode yet</span>
        </>
      )}
    </p>
  );
}