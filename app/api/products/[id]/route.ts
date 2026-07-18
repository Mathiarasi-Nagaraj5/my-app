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

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return ApiResponse.error(
        "Invalid product id",
        400
      );

    const product = await Product.findById(id);

    if (!product)
      return ApiResponse.error(
        "Product not found",
        404
      );

    return ApiResponse.success(
      product,
      "Product fetched successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Unable to fetch product"
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return ApiResponse.error(
        "Invalid product id",
        400
      );

    const body = await request.json();

    const updated = await Product.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated)
      return ApiResponse.error(
        "Product not found",
        404
      );

    return ApiResponse.success(
      updated,
      "Product updated successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Unable to update product"
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return ApiResponse.error(
        "Invalid product id",
        400
      );

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted)
      return ApiResponse.error(
        "Product not found",
        404
      );

    return ApiResponse.success(
      null,
      "Product deleted successfully"
    );
  } catch (error) {
    console.error(error);

    return ApiResponse.error(
      "Unable to delete product"
    );
  }
}