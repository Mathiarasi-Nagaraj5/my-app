import { NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import User from "../../models/User";
import { classifyCustomer } from "@/app/lib/customers/classify";
import Order from "@/app/models/Order";



export async function GET() {
  try {
    await connectDB();

    const users = await User.find({ role: "customer" })
      .select("fullName email phone createdAt")
      .lean();

    // Order stats per email — matches shippingAddress.email so this works
    // for both logged-in and guest checkouts, not just registered users
    // with orders tied to userId.
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$shippingAddress.email",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
          returnedOrders: { $sum: { $cond: [{ $eq: ["$status", "Returned"] }, 1, 0] } },
          cancelledCodOrders: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "Cancelled"] }, { $eq: ["$paymentMethod", "cod"] }] },
                1,
                0,
              ],
            },
          },
          lastOrderAt: { $max: "$createdAt" },
        },
      },
    ]);

    // Normalize emails when building the lookup map so case differences
    // between User.email and Order.shippingAddress.email don't cause a miss.
    const statsByEmail = new Map(
      orderStats.map((s) => [String(s._id ?? "").toLowerCase().trim(), s])
    );

    const customers = users.map((user) => {
      const stats = statsByEmail.get(String(user.email ?? "").toLowerCase().trim());
      const tag = classifyCustomer({
        totalOrders: stats?.totalOrders ?? 0,
        deliveredOrders: stats?.deliveredOrders ?? 0,
        returnedOrders: stats?.returnedOrders ?? 0,
        cancelledCodOrders: stats?.cancelledCodOrders ?? 0,
      });

      return {
        _id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        totalOrders: stats?.totalOrders ?? 0,
        totalSpent: stats?.totalSpent ?? 0,
        lastOrderAt: stats?.lastOrderAt ?? null,
        tag,
      };
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error("Fetch Customers Error:", error);
    return NextResponse.json({ success: false, message: "failed to load customers" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const user = await User.create(body);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create User",
      },
      { status: 500 }
    );
  }
}