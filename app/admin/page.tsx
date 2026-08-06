"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/admin/StatsCard";
import SalesOverviewChart, { SalesPoint } from "@/components/admin/Salesoverviewchart";
import TopCategoriesChart, { CategorySlice } from "@/components/admin/Topcategorieschart";
import RecentOrdersList, { RecentOrderRow } from "@/components/admin/Recentorderslist";
import ActivityFeed, { ActivityEvent } from "@/components/admin/Activityfeed";



type SalesRange = "week" | "month" | "year" | "custom";

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  ordersChangePercent: number;
  revenueChangePercent: number;
  salesOverview: SalesPoint[];
  topCategories: CategorySlice[];
  recentOrders: RecentOrderRow[];
  activity: ActivityEvent[];
}

const RANGE_OPTIONS: { value: SalesRange; label: string }[] = [
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "year", label: "12 months" },
  { value: "custom", label: "Custom" },
];

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

// defaults for the custom range inputs: last 7 days
const todayStr = new Date().toISOString().slice(0, 10);
const weekAgoStr = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<SalesRange>("week");
  const [customFrom, setCustomFrom] = useState(weekAgoStr);
  const [customTo, setCustomTo] = useState(todayStr);

  useEffect(() => {
    // for custom range, wait until both dates are picked (they always are,
    // since they default to a valid pair, but this guards a cleared input)
    if (range === "custom" && (!customFrom || !customTo)) return;

    setLoading(true);
    const params = new URLSearchParams({ range });
    if (range === "custom") {
      params.set("from", customFrom);
      params.set("to", customTo);
    }

    fetch(`/api/admin/stats?${params.toString()}`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [range, customFrom, customTo]);

  return (
    <div className="overflow-y-hidden">
      <h1 className="mb-1 text-2xl font-medium text-charcoal">Dashboard</h1>
      <p className="mb-5 text-lg text-charcoal/55">
        {new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {!stats && loading ? (
        <p className="text-sm text-charcoal/55">loading stats...</p>
      ) : !stats ? (
        <p className="text-sm text-red-600">failed to load dashboard stats.</p>
      ) : (
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatsCard
              label="Today's orders"
              value={String(stats.todayOrders ?? 0)}
              changePercent={stats.ordersChangePercent}
            />
            <StatsCard
              label="Today's revenue"
              value={formatINR(stats.todayRevenue ?? 0)}
              changePercent={stats.revenueChangePercent}
            />
            <StatsCard label="Pending orders" value={String(stats.pendingOrders ?? 0)} accent />
            <StatsCard label="Total products" value={String(stats.totalProducts ?? 0)} />
          </div>

          {/* range selector — controls both charts below */}
          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            {range === "custom" && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={customFrom}
                  max={customTo}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded border border-charcoal/20 px-2 py-1 text-charcoal"
                />
                <span className="text-charcoal/40">to</span>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  max={todayStr}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded border border-charcoal/20 px-2 py-1 text-charcoal"
                />
              </div>
            )}
            <div className="flex gap-1">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRange(opt.value)}
                  className={`rounded px-3 py-1.5 text-xs ${
                    range === opt.value
                      ? "bg-pink font-medium text-charcoal"
                      : "text-charcoal/60 hover:bg-charcoal/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="min-w-0">
              <SalesOverviewChart
                data={stats.salesOverview ?? []}
                title={
                  range === "custom"
                    ? `Sales overview · ${customFrom} to ${customTo}`
                    : `Sales overview · ${RANGE_OPTIONS.find((o) => o.value === range)?.label}`
                }
                loading={loading}
              />
            </div>
            <div className="min-w-0">
              <TopCategoriesChart data={stats.topCategories ?? []} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="min-w-0">
              <RecentOrdersList orders={stats.recentOrders ?? []} />
            </div>
            <div className="min-w-0">
              <ActivityFeed events={stats.activity ?? []} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}