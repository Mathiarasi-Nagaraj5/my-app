import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Product from "@/app/models/Product";
import User from "@/app/models/User";
import { requireAdmin } from "@/app/lib/auth/requireAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Cell = string | number;
type Row = Record<string, Cell>;
type Column = { header: string; key: string; width: number };

const fmtDate = (d?: Date | string) =>
  d ? new Date(d).toISOString().slice(0, 19).replace("T", " ") : "";

// ── Customers ──
async function customersData(): Promise<{ columns: Column[]; rows: Row[] }> {
  // passwordHash and googleId are deliberately never selected
  const users = await User.find({ role: "customer" })
    .select("fullName email phone provider createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const stats = await Order.aggregate([
    { $match: { userId: { $exists: true }, status: { $nin: ["Cancelled"] } } },
    { $group: { _id: "$userId", orders: { $sum: 1 }, spent: { $sum: "$total" }, last: { $max: "$createdAt" } } },
  ]);
  const byUser = new Map(stats.map((s) => [String(s._id), s]));

  return {
    columns: [
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Sign-up method", key: "provider", width: 14 },
      { header: "Joined", key: "joined", width: 20 },
      { header: "Orders", key: "orders", width: 10 },
      { header: "Total spent (₹)", key: "spent", width: 16 },
      { header: "Last order", key: "last", width: 20 },
    ],
    rows: users.map((u: any) => {
      const s = byUser.get(String(u._id));
      return {
        name: u.fullName,
        email: u.email,
        phone: u.phone ?? "",
        provider: u.provider,
        joined: fmtDate(u.createdAt),
        orders: s?.orders ?? 0,
        spent: s?.spent ?? 0,
        last: fmtDate(s?.last),
      };
    }),
  };
}

// ── Orders ──
async function ordersData(from?: string, to?: string): Promise<{ columns: Column[]; rows: Row[] }> {
  const filter: Record<string, any> = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

  return {
    columns: [
      { header: "Order #", key: "orderNumber", width: 12 },
      { header: "Date", key: "date", width: 20 },
      { header: "Customer", key: "name", width: 22 },
      { header: "Email", key: "email", width: 28 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Address", key: "address", width: 40 },
      { header: "City", key: "city", width: 16 },
      { header: "State", key: "state", width: 16 },
      { header: "Pincode", key: "pincode", width: 10 },
      { header: "Items", key: "items", width: 50 },
      { header: "Qty", key: "qty", width: 6 },
      { header: "Payment method", key: "method", width: 14 },
      { header: "Payment status", key: "payStatus", width: 14 },
      { header: "Order status", key: "status", width: 16 },
      { header: "Subtotal (₹)", key: "subtotal", width: 13 },
      { header: "Delivery (₹)", key: "delivery", width: 12 },
      { header: "Discount (₹)", key: "discount", width: 12 },
      { header: "Promo code", key: "promo", width: 14 },
      { header: "Total (₹)", key: "total", width: 12 },
      { header: "Courier", key: "courier", width: 16 },
      { header: "AWB", key: "awb", width: 18 },
      { header: "Shipment status", key: "shipStatus", width: 16 },
      { header: "Delivered at", key: "deliveredAt", width: 20 },
      { header: "Refunded (₹)", key: "refund", width: 12 },
    ],
    rows: orders.map((o: any) => ({
      orderNumber: o.orderNumber,
      date: fmtDate(o.createdAt),
      name: o.shippingAddress?.fullName ?? "",
      email: o.shippingAddress?.email ?? "",
      phone: o.shippingAddress?.phone ?? "",
      address: o.shippingAddress?.addressLine ?? "",
      city: o.shippingAddress?.city ?? "",
      state: o.shippingAddress?.state ?? "",
      pincode: o.shippingAddress?.pincode ?? "",
      items: (o.items ?? [])
        .map((i: any) => `${i.name}${i.size ? ` / ${i.size}` : ""}${i.color ? ` / ${i.color}` : ""} x${i.quantity}`)
        .join("; "),
      qty: (o.items ?? []).reduce((n: number, i: any) => n + i.quantity, 0),
      method: String(o.paymentMethod ?? "").toUpperCase(),
      payStatus: o.paymentStatus ?? "",
      status: o.status ?? "",
      subtotal: o.subtotal ?? 0,
      delivery: o.delivery ?? 0,
      discount: o.discount ?? 0,
      promo: o.promoCode ?? "",
      total: o.total ?? 0,
      courier: o.shipment?.courierName ?? "",
      awb: o.shipment?.awbCode ?? "",
      shipStatus: o.shipment?.currentStatus ?? "",
      deliveredAt: fmtDate(o.deliveredAt),
      refund: o.refund?.amount ?? 0,
    })),
  };
}

// ── Inventory ──
async function inventoryData(): Promise<{ columns: Column[]; rows: Row[] }> {
  const products = await Product.find().sort({ name: 1 }).lean();

  return {
    columns: [
      { header: "SKU", key: "sku", width: 18 },
      { header: "Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 18 },
      { header: "Price (₹)", key: "price", width: 11 },
      { header: "Original price (₹)", key: "orig", width: 16 },
      { header: "Stock", key: "stock", width: 8 },
      { header: "Stock status", key: "stockStatus", width: 14 },
      { header: "Sizes", key: "sizes", width: 28 },
      { header: "Colors", key: "colors", width: 24 },
      { header: "Rating", key: "rating", width: 8 },
      { header: "Reviews", key: "reviews", width: 9 },
      { header: "Bestseller", key: "best", width: 11 },
      { header: "Created", key: "created", width: 20 },
    ],
    rows: products.map((p: any) => ({
      sku: p.sku,
      name: p.name,
      category: (p.category ?? []).join(", "),
      price: p.price ?? 0,
      orig: p.originalPrice ?? "",
      stock: p.stock ?? 0,
      stockStatus: p.stock <= 0 ? "Out of stock" : p.stock <= 5 ? "Low stock" : "In stock",
      sizes: (p.sizes ?? []).join(", "),
      colors: (p.colors ?? []).join(", "),
      rating: p.rating ?? 0,
      reviews: p.reviewCount ?? 0,
      best: p.isBestseller ? "Yes" : "No",
      created: fmtDate(p.createdAt),
    })),
  };
}

// ── CSV helpers ──
// Prefixing risky leading characters stops spreadsheet formula injection
// (a customer could otherwise set their name to "=HYPERLINK(...)").
const safe = (v: Cell) => (typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v);
const csvCell = (v: Cell) => {
  const s = String(safe(v));
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) {
    return NextResponse.json({ success: false, message: adminCheck.message }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  try {
    await connectDB();

    let data;
    if (type === "customers") data = await customersData();
    else if (type === "orders") data = await ordersData(searchParams.get("from") ?? undefined, searchParams.get("to") ?? undefined);
    else if (type === "inventory") data = await inventoryData();
    else return NextResponse.json({ success: false, message: "invalid type" }, { status: 400 });

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `${type}-${stamp}.${format}`;
    const headers = {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    };

    if (format === "csv") {
      const lines = [
        data.columns.map((c) => csvCell(c.header)).join(","),
        ...data.rows.map((r) => data.columns.map((c) => csvCell(r[c.key] ?? "")).join(",")),
      ];
      // BOM so Excel reads ₹ and non-English names correctly
      const body = "\uFEFF" + lines.join("\r\n");
      return new NextResponse(body, {
        headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" },
      });
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(type!);
    ws.columns = data.columns;
    data.rows.forEach((r) => {
      const row: Row = {};
      for (const c of data.columns) row[c.key] = safe(r[c.key] ?? "");
      ws.addRow(row);
    });
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: data.columns.length } };

    const buf = await wb.xlsx.writeBuffer();
    return new NextResponse(buf as ArrayBuffer, {
      headers: {
        ...headers,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ success: false, message: "export failed" }, { status: 500 });
  }
}