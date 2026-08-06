import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";
import Category from "@/app/models/Category";

const slugify = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const slug = slugify(name);
  const existing = await Category.findOne({ slug });
  if (existing) {
    return NextResponse.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await Category.create({ name: name.trim(), slug });
  return NextResponse.json(category, { status: 201 });
}