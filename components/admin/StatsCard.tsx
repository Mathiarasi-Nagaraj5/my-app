import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string;
  accent?: boolean;
  // optional — omit and the card renders exactly as it did before
  changePercent?: number;
}

export default function StatsCard({ label, value, accent = false, changePercent }: StatsCardProps) {
  const hasTrend = typeof changePercent === "number";
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <div className="rounded-card border border-charcoal/10 bg-white p-2">
      <p className="mb-1.5 text-md text-charcoal">{label}</p>
      <p className={`text-2xl font-medium ${accent ? "text-brass" : "text-charcoal"}`}>
        {value}
      </p>
      {hasTrend && (
        <p
          className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(changePercent as number).toFixed(1)}% vs yesterday
        </p>
      )}
    </div>
  );
}