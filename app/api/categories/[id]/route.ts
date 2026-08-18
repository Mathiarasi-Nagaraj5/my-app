import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import Category from "@/app/models/Category";

const slugify = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;
  const { name } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Category name is required" },
      { status: 400 }
    );
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    {
      name: name.trim(),
      slug: slugify(name),
    },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;

  const deleted = await Category.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}