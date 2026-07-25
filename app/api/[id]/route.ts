import { NextRequest } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Address from "@/app/models/Address";
import { ApiResponse } from "@/app/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const address = await Address.findByIdAndUpdate(id, body, { new: true });

    if (!address) {
      return ApiResponse.error("Address not found", 404);
    }

    return ApiResponse.success(address, "Address updated successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to update address");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const address = await Address.findByIdAndDelete(id);

    if (!address) {
      return ApiResponse.error("Address not found", 404);
    }

    return ApiResponse.success(null, "Address deleted successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to delete address");
  }
}