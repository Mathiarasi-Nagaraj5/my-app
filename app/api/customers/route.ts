import { NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import User from "../../models/User";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch Users",
      },
      { status: 500 }
    );
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