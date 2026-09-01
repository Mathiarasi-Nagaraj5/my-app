import mongoose from "mongoose";
import { NextRequest } from "next/server";

import connectDB from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import { ApiResponse } from "@/app/lib/api-response";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

function normalizeToArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [...new Set(value.map((v) => String(v).trim()).filter(Boolean))];
  }
  if (typeof value === "string") {
    return [...new Set(value.split(",").map((v) => v.trim()).filter(Boolean))];
  }
  return [];
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) return ApiResponse.error("Invalid product id", 400);

    const product = await Product.findById(id);

    if (!product) return ApiResponse.error("Product not found", 404);

    return ApiResponse.success(product, "Product fetched successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to fetch product");
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) return ApiResponse.error("Invalid product id", 400);

    const body = await request.json();

    const update = { ...body };
    // Only normalize if the field was actually included in this update —
    // a partial edit that doesn't touch sizes/colors shouldn't wipe them.
    if (body.sizes !== undefined) update.sizes = normalizeToArray(body.sizes);
    if (body.colors !== undefined) update.colors = normalizeToArray(body.colors);

    const updated = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) return ApiResponse.error("Product not found", 404);

    return ApiResponse.success(updated, "Product updated successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to update product");
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) return ApiResponse.error("Invalid product id", 400);

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) return ApiResponse.error("Product not found", 404);

    return ApiResponse.success(null, "Product deleted successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to delete product");
  }
}