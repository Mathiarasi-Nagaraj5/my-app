export type OrderStatus =
  "Confirmed" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";

const SHIPPED = new Set([
  "PICKUP SCHEDULED", "PICKUP GENERATED", "OUT FOR PICKUP", "PICKED UP",
  "SHIPPED", "IN TRANSIT", "REACHED AT DESTINATION HUB",
]);
const OUT_FOR_DELIVERY = new Set(["OUT FOR DELIVERY"]);
const DELIVERED = new Set(["DELIVERED"]);
const CANCELLED = new Set(["CANCELLED", "CANCELED"]);
const RTO = new Set(["RTO INITIATED", "RTO IN TRANSIT", "RTO OUT FOR DELIVERY", "RTO DELIVERED"]);

export function mapShiprocketStatusToOrderStatus(raw: string): OrderStatus | null {
  const s = raw.trim().toUpperCase();
  if (DELIVERED.has(s)) return "Delivered";
  if (OUT_FOR_DELIVERY.has(s)) return "Out for Delivery";
  if (SHIPPED.has(s)) return "Shipped";
  if (CANCELLED.has(s)) return "Cancelled";
  if (RTO.has(s)) return "Returned";
  return null;
}