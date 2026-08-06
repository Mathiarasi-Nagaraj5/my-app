import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Product from "@/app/models/Product";

export const dynamic = "force-dynamic";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const IST_TIMEZONE = "+05:30";

function startOfDayIST(date: Date) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

type SalesRange = "week" | "month" | "year" | "custom";
type BucketUnit = "day" | "month";

interface RangeConfig {
  start: Date;
  end: Date;
  groupFormat: string;
  unit: BucketUnit;
  points: number;
}

function monthsBetweenInclusive(start: Date, end: Date) {
  const endInclusive = new Date(end.getTime() - 1);
  return (
    (endInclusive.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (endInclusive.getUTCMonth() - start.getUTCMonth()) +
    1
  );
}

function getRangeConfig(
  range: SalesRange,
  today: Date,
  customFrom: string | null,
  customTo: string | null
): RangeConfig {
  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);

  if (range === "year") {
    const start = new Date(today);
    start.setDate(1);
    start.setMonth(start.getMonth() - 11);
    return { start, end: todayEnd, groupFormat: "%Y-%m", unit: "month", points: 12 };
  }

  if (range === "month") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { start, end: todayEnd, groupFormat: "%Y-%m-%d", unit: "day", points: 30 };
  }

  if (range === "custom" && customFrom && customTo) {
    const start = startOfDayIST(new Date(customFrom));
    const rawEnd = startOfDayIST(new Date(customTo));
    const end = new Date(rawEnd);
    end.setDate(end.getDate() + 1);

    const spanDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));

    if (spanDays > 62) {
      const points = monthsBetweenInclusive(start, end);
      return { start, end, groupFormat: "%Y-%m", unit: "month", points };
    }
    return { start, end, groupFormat: "%Y-%m-%d", unit: "day", points: spanDays };
  }

  const start = new Date(today);
  start.setDate(start.getDate() - 6);
  return { start, end: todayEnd, groupFormat: "%Y-%m-%d", unit: "day", points: 7 };
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range");
    const range: SalesRange =
      rangeParam === "month" || rangeParam === "year" || rangeParam === "custom"
        ? rangeParam
        : "week";
    const customFrom = searchParams.get("from");
    const customTo = searchParams.get("to");

    const today = startOfDayIST(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todayOrders, yesterdayOrders, totalProducts, pendingOrders] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      Product.countDocuments(),
      Order.countDocuments({ paymentStatus: "PENDING" }),
    ]);

    const [todayRevenueAgg, yesterdayRevenueAgg] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: yesterday, $lt: today }, paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    const todayRevenue = todayRevenueAgg[0]?.total ?? 0;
    const yesterdayRevenue = yesterdayRevenueAgg[0]?.total ?? 0;

    const { start, end, groupFormat, points, unit } = getRangeConfig(range, today, customFrom, customTo);

    const salesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, paymentStatus: "PAID" } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt", timezone: IST_TIMEZONE } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesByKey = new Map(salesAgg.map((d) => [d._id, d.revenue]));
    const salesOverview = Array.from({ length: points }, (_, i) => {
      const date = new Date(start);
      if (unit === "month") date.setMonth(date.getMonth() + i);
      else date.setDate(date.getDate() + i);

      const istShifted = new Date(date.getTime() + IST_OFFSET_MS);
      const key = unit === "month" ? istShifted.toISOString().slice(0, 7) : istShifted.toISOString().slice(0, 10);
      const label =
        unit === "month"
          ? istShifted.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
          : istShifted.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

      return { date: label, revenue: salesByKey.get(key) ?? 0 };
    });

    const categoryAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, paymentStatus: "PAID" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $lookup: {
          from: "products",
          let: { pid: { $toObjectId: "$_id" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$pid"] } } }],
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$product.category", "unknown"] },
          revenue: { $sum: "$revenue" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalCategoryRevenue = categoryAgg.reduce((sum, c) => sum + c.revenue, 0);
    const topCategories = categoryAgg.map((c) => ({
      category: c._id,
      percent:
        totalCategoryRevenue > 0
          ? Math.round((c.revenue / totalCategoryRevenue) * 1000) / 10
          : 0,
    }));

    const recentOrdersRaw = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentOrders = recentOrdersRaw.map((o) => {
      const firstItemName = o.items?.[0]?.name ?? "—";
      const extraCount = (o.items?.length ?? 0) - 1;
      return {
        orderNumber: o.orderNumber,
        customer: o.shippingAddress?.fullName ?? "unknown",
        product: extraCount > 0 ? `${firstItemName} +${extraCount} more` : firstItemName,
        amount: o.total,
        status: o.status,
      };
    });

    function timeAgo(date: Date) {
      const diffMs = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 1) return "just now";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }

    const activity = recentOrdersRaw.slice(0, 5).map((o) => {
      const itemCount = o.items?.length ?? 0;
      const isPaid = o.paymentStatus === "PAID";
      return {
        id: o._id.toString(),
        type: isPaid ? ("payment" as const) : ("order" as const),
        message: isPaid
          ? `Payment received for Order Number : ${o.orderNumber}`
          : `New Order Number : ${o.orderNumber} placed`,
        meta: `${itemCount} ${itemCount === 1 ? "item" : "items"} · ₹${o.total.toLocaleString("en-IN")}`,
        timeAgo: timeAgo(o.createdAt),
      };
    });

    return NextResponse.json({
      todayOrders,
      todayRevenue,
      pendingOrders,
      totalProducts,
      ordersChangePercent: percentChange(todayOrders, yesterdayOrders),
      revenueChangePercent: percentChange(todayRevenue, yesterdayRevenue),
      salesOverview,
      topCategories,
      recentOrders,
      activity,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "failed to fetch stats" }, { status: 500 });
  }
}