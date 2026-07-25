"use client";

import { useEffect, useState } from "react";
import ReturnsTable, { AdminReturn } from "@/components/admin/ReturnsTable";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<AdminReturn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/returns")
      .then((res) => res.json())
      .then(setReturns)
      .finally(() => setLoading(false));
  }, []);

  const handleProcessed = (id: string, updated: Partial<AdminReturn>) => {
    setReturns((prev) => prev.map((r) => (r._id === id ? { ...r, ...updated } : r)));
  };

  return (
    <div>
      <h1 className="mb-5 text-xl font-medium text-charcoal">Returns</h1>

      {loading ? (
        <p className="text-lg text-charcoal/55">Loading returns...</p>
      ) : (
        <ReturnsTable returns={returns} onProcessed={handleProcessed} />
      )}
    </div>
  );
}