import mongoose from "mongoose";
import Product from "@/app/models/Product";
import { DEFAULT_PACKAGE_DIMENSIONS_CM } from "./pricing";
import type { CreateForwardOrderPayload } from "./types";

// Shiprocket rejects an empty billing_last_name (422 validation.present),
// and many customers have a single name, so fall back to a placeholder.
function splitName(fullName: string): { first: string; last: string } {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    first: parts[0] || "Customer",
    last: parts.length > 1 ? parts.slice(1).join(" ") : "-",
  };
}

export async function buildForwardOrderPayload(
  order: any,
  pickupLocation: string,
  weightKg: number
): Promise<CreateForwardOrderPayload> {
  const { first, last } = splitName(order.shippingAddress.fullName);

  // Look up real SKUs: order items only store the product's _id
  const ids = order.items
    .map((i: any) => String(i.productId))
    .filter((id: string) => mongoose.isValidObjectId(id));

  const products = await Product.find({ _id: { $in: ids } })
    .select("sku")
    .lean();
  const skuById = new Map(products.map((p: any) => [String(p._id), p.sku as string]));

  // Items vs order total: the difference is shipping (positive) or discount (negative)
  const itemsTotal = order.items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  );
  const diff = order.total - itemsTotal;

  return {
    order_id: order.orderNumber,
    order_date: new Date(order.createdAt).toISOString().slice(0, 16).replace("T", " "),
    pickup_location: pickupLocation,
    billing_customer_name: first,
    billing_last_name: last,
    billing_address: order.shippingAddress.addressLine,
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.pincode,
    billing_state: order.shippingAddress.state,
    billing_country: "India",
    billing_email: order.shippingAddress.email,
    billing_phone: order.shippingAddress.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item: any) => {
      const baseSku = skuById.get(String(item.productId)) ?? String(item.productId);
      return {
        name: item.name,
        sku: [baseSku, item.size].filter(Boolean).join("-"), // e.g. TSH-BLK-001-XL
        units: item.quantity,
        selling_price: item.price,
      };
    }),
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: order.total,
    ...(diff > 0 ? { shipping_charges: diff } : {}),
    ...(diff < 0 ? { total_discount: -diff } : {}),
    length: DEFAULT_PACKAGE_DIMENSIONS_CM.length,
    breadth: DEFAULT_PACKAGE_DIMENSIONS_CM.breadth,
    height: DEFAULT_PACKAGE_DIMENSIONS_CM.height,
    weight: weightKg,
  };
}