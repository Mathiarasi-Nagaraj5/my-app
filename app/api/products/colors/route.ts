import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";

// Distinct colors actually in use across the catalog — powers the filter
// sidebar's color swatches, replacing a hardcoded 3-color list that had no
// relationship to real product data.
export async function GET() {
  try {
    await connectDB();
    const colors: string[] = await Product.distinct("colors");
    return NextResponse.json(colors.filter(Boolean));
  } catch (error) {
    console.error("Fetch product colors error:", error);
    return NextResponse.json([], { status: 500 });
  }
}