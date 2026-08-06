"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface SalesPoint {
  date: string;
  revenue: number;
}

const PINK = "#e0629b";

export default function SalesOverviewChart({
  data,
  title = "Sales overview",
  loading = false,
}: {
  data: SalesPoint[];
  title?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-card border border-charcoal/10 bg-white p-4">
      <p className="mb-4 text-md text-charcoal">{title}</p>

      {loading ? (
        <div className="flex h-[180px] items-center justify-center">
          <div className="h-full w-full animate-pulse rounded bg-charcoal/5" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PINK} stopOpacity={0.35} />
                <stop offset="100%" stopColor={PINK} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e0d8" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#5c554c" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#5c554c" }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              formatter={(value) => [
                `₹${(typeof value === "number" ? value : 0).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
              contentStyle={{ borderRadius: 8, borderColor: "#e5e0d8", fontSize: 12 }}
            />
            <Area type="monotone" dataKey="revenue" stroke={PINK} strokeWidth={2} fill="url(#revenueFill)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}