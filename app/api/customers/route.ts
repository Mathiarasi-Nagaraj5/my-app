import { NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Customer from "../../models/Customer";

export async function GET() {
  try {
    await connectDB();

    const customers = await Customer.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch customers",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const customer = await Customer.create(body);

    return NextResponse.json(
      {
        success: true,
        data: customer,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create customer",
      },
      { status: 500 }
    );
  }
}