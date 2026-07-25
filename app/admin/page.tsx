"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/admin/StatsCard";
import SalesOverviewChart, { SalesPoint } from "@/components/admin/Salesoverviewchart";
import TopCategoriesChart, { CategorySlice } from "@/components/admin/Topcategorieschart";
import RecentOrdersList, { RecentOrderRow } from "@/components/admin/Recentorderslist";
import ActivityFeed, { ActivityEvent } from "@/components/admin/Activityfeed";

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

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

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

      {!stats ? (
        <p className="text-sm text-charcoal/55">loading stats...</p>
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

       <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
  <div className="min-w-0">
    <SalesOverviewChart data={stats.salesOverview ?? []} />
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