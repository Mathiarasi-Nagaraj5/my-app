import { NextResponse } from "next/server";
import { checkServiceability } from "@/app/lib/shiprocket/client";
import { computePackageWeightKg } from "@/app/lib/shiprocket/pricing";
import { enforceRateLimit } from "@/app/lib/rateLimitResponse";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "shipping-serviceability", 20, 60 * 1000);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { pincode, itemCount, cod } = body;

    if (!pincode || typeof pincode !== "string" || pincode.length !== 6) {
      return NextResponse.json({ success: false, message: "a valid 6-digit pincode is required" }, { status: 400 });
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
    if (!pickupPincode) {
      return NextResponse.json({ success: false, message: "pickup pincode is not configured" }, { status: 500 });
    }

    const weightKg = computePackageWeightKg(Number(itemCount) || 1);

    const result = await checkServiceability({
      pickupPincode,
      deliveryPincode: pincode,
      weightKg,
      cod: Boolean(cod),
    });

    const couriers = result.data?.available_courier_companies ?? [];
    if (couriers.length === 0) {
      return NextResponse.json({ success: true, serviceable: false, couriers: [] });
    }

    const cheapest = [...couriers].sort((a, b) => a.rate - b.rate)[0];

    return NextResponse.json({
      success: true,
      serviceable: true,
      couriers,
      recommendedCourierId: result.data.recommended_courier_id ?? cheapest.courier_company_id,
      cheapestCourierId: cheapest.courier_company_id,
    });
  } catch (error) {
    console.error("Serviceability Check Error:", error);
    return NextResponse.json({ success: false, message: "failed to check serviceability" }, { status: 500 });
  }
}