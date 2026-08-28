export type OrderStatus = "Confirmed" | "In Transit" | "Delivered" | "Cancelled" | "Returned";

const IN_TRANSIT_STATUSES = new Set([
  "SHIPPED", "IN TRANSIT", "OUT FOR DELIVERY", "OUT FOR PICKUP", "PICKED UP", "REACHED AT DESTINATION HUB",
]);
const DELIVERED_STATUSES = new Set(["DELIVERED"]);
const CANCELLED_STATUSES = new Set(["CANCELLED", "CANCELED"]);
const RTO_STATUSES = new Set(["RTO INITIATED", "RTO IN TRANSIT", "RTO DELIVERED"]);

export function mapShiprocketStatusToOrderStatus(rawStatus: string): OrderStatus | null {
  const normalized = rawStatus.trim().toUpperCase();
  if (DELIVERED_STATUSES.has(normalized)) return "Delivered";
  if (IN_TRANSIT_STATUSES.has(normalized)) return "In Transit";
  if (CANCELLED_STATUSES.has(normalized) || RTO_STATUSES.has(normalized)) return "Cancelled";
  return null;
}