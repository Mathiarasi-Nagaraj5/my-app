import { NextRequest } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Address from "@/app/models/Address";
import { ApiResponse } from "@/app/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return ApiResponse.error("userId is required", 400);
    }

    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    return ApiResponse.success(addresses, "Addresses fetched successfully");
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to fetch addresses");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, label, fullName, phone, addressLine, city, state, pincode } = body;

    if (!userId) return ApiResponse.error("userId is required", 400);
    if (!fullName) return ApiResponse.error("Full name is required", 400);
    if (!addressLine) return ApiResponse.error("Address line is required", 400);
    if (!city) return ApiResponse.error("City is required", 400);
    if (!state) return ApiResponse.error("State is required", 400);
    if (!pincode) return ApiResponse.error("Pincode is required", 400);

    const address = await Address.create({
      userId,
      label,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
    });

    return ApiResponse.success(address, "Address saved successfully", 201);
  } catch (error) {
    console.error(error);
    return ApiResponse.error("Unable to save address");
  }
}