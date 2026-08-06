import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Category from "@/app/models/Category";

const slugify = (name: string) =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const updated = await Category.findByIdAndUpdate(
    params.id,
    { name: name.trim(), slug: slugify(name) },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const deleted = await Category.findByIdAndDelete(params.id);

  if (!deleted) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}