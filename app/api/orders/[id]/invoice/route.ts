import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import { generateInvoicePdf } from "@/app/lib/invoice/generateInvoicePdf";

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

    const pdfBuffer = await generateInvoicePdf(order);

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