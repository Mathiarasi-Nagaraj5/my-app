import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Product from "@/app/models/Product";

// This route was previously computing "today" using the server's UTC clock,
// which drifts a full calendar day behind IST during early morning hours
// (e.g. 1am IST = 7:30pm the PREVIOUS day in UTC). Since the store operates
// in India, every date boundary below is computed in IST instead.
export const dynamic = "force-dynamic"; // never let Next.js cache this route

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const IST_TIMEZONE = "+05:30";

// Returns the UTC instant corresponding to IST midnight, for the IST
// calendar day that `date` falls on. This is what you compare createdAt
// (stored in UTC) against with $gte to correctly bucket "today" in IST.
function startOfDayIST(date: Date) {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET() {
  try {
    await connectDB();

    const today = startOfDayIST(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

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

    // group by IST calendar day, not UTC — the `timezone` option is the fix
    const salesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: "PAID" } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: IST_TIMEZONE,
            },
          },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const salesByDate = new Map(salesAgg.map((d) => [d._id, d.revenue]));
    const salesOverview = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      // format this date the same IST-shifted way the aggregation grouped it
      const istShifted = new Date(date.getTime() + IST_OFFSET_MS);
      const key = istShifted.toISOString().slice(0, 10);
      return { date: key, revenue: salesByDate.get(key) ?? 0 };
    });

    const categoryAgg = await Order.aggregate([
      { $match: { paymentStatus: "PAID" } },
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
          ? `Payment received for order #${o.orderNumber}`
          : `New order #${o.orderNumber} placed`,
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
    return NextResponse.json(
      { error: "failed to fetch stats" },
      { status: 500 }
    );
  }
}
