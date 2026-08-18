import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";

const formatINR = (v: number) => `Rs. ${v.toLocaleString("en-IN")}`;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }

    if (order.status !== "Delivered") {
      return NextResponse.json(
        { error: "invoice is only available once the order is delivered" },
        { status: 400 }
      );
    }

    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // header
      doc.fontSize(20).text("Tax Invoice", { align: "right" });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor("#555").text(`Order #${order.orderNumber}`, { align: "right" });
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, { align: "right" });
      doc.moveDown(1.5);

      // billing details
      doc.fillColor("#000").fontSize(12).text("Billed To:", { underline: true });
      doc.fontSize(10).fillColor("#333");
      doc.text(order.shippingAddress.fullName);
      doc.text(order.shippingAddress.phone);
      doc.text(
        `${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
      );
      doc.moveDown(1.5);

      // items table header
      const tableTop = doc.y;
      const col = { name: 50, qty: 300, price: 370, total: 460 };

      doc.fontSize(10).fillColor("#000");
      doc.text("Item", col.name, tableTop);
      doc.text("Qty", col.qty, tableTop);
      doc.text("Price", col.price, tableTop);
      doc.text("Total", col.total, tableTop);
      doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor("#ccc").stroke();

      let y = tableTop + 25;
      doc.fillColor("#333");
      order.items.forEach((item: { name: string; quantity: number; price: number }) => {
        doc.text(item.name, col.name, y, { width: 230 });
        doc.text(String(item.quantity), col.qty, y);
        doc.text(formatINR(item.price), col.price, y);
        doc.text(formatINR(item.price * item.quantity), col.total, y);
        y += 22;
      });

      doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor("#ccc").stroke();
      y += 20;

      // totals
      doc.fontSize(10).fillColor("#000");
      doc.text("Subtotal", col.price, y);
      doc.text(formatINR(order.subtotal), col.total, y);
      y += 18;

      doc.text("Delivery", col.price, y);
      doc.text(order.delivery === 0 ? "Free" : formatINR(order.delivery), col.total, y);
      y += 18;

      doc.fontSize(12).text("Total", col.price, y, { continued: false });
      doc.text(formatINR(order.total), col.total, y);
      y += 30;

      doc.fontSize(9).fillColor("#777");
      doc.text(
        `Payment: ${order.paymentMethod.toUpperCase()} - ${order.paymentStatus}`,
        50,
        y
      );

      doc.moveDown(2);
      doc.fontSize(8).fillColor("#999").text("This is a system-generated invoice.", 50, doc.page.height - 80);

      doc.end();
    });

   return new NextResponse(new Uint8Array(pdfBuffer), {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
  },
});
  } catch (error) {
    console.error("GET /api/orders/[id]/invoice error:", error);
    return NextResponse.json({ error: "failed to generate invoice" }, { status: 500 });
  }
}