import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import ReturnRequest from "@/app/models/ReturnRequest";
import Order from "@/app/models/Order";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/returns/[id] -> admin accepts or rejects a pending return
export async function PATCH(req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { status, adminNote } = body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return NextResponse.json({ success: false, message: "status must be Accepted or Rejected" }, { status: 400 });
    }

    const returnRequest = await ReturnRequest.findById(id);
    if (!returnRequest) {
      return NextResponse.json({ success: false, message: "return request not found" }, { status: 404 });
    }
    if (returnRequest.status !== "Pending") {
      return NextResponse.json(
        { success: false, message: "this return request has already been resolved" },
        { status: 400 }
      );
    }

    returnRequest.status = status;
    returnRequest.adminNote = adminNote?.trim() || undefined;
    returnRequest.resolvedAt = new Date();
    await returnRequest.save();

    if (status === "Accepted") {
      await Order.findByIdAndUpdate(returnRequest.orderId, { status: "Returned" });
    }

    return NextResponse.json({ success: true, data: returnRequest });
  } catch {
    return NextResponse.json({ success: false, message: "failed to update return request" }, { status: 500 });
  }
}