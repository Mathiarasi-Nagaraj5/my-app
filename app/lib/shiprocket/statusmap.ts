export type OrderStatus = "Confirmed" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";

const IN_TRANSIT_STATUSES = new Set([
  "SHIPPED", "Out for Delivery", "OUT FOR DELIVERY", "OUT FOR PICKUP", "PICKED UP", "REACHED AT DESTINATION HUB",
]);
const DELIVERED_STATUSES = new Set(["DELIVERED"]);
const CANCELLED_STATUSES = new Set(["CANCELLED", "CANCELED"]);
const RTO_STATUSES = new Set(["RTO INITIATED", "RTO Out for Delivery", "RTO DELIVERED"]);

export function mapShiprocketStatusToOrderStatus(rawStatus: string): OrderStatus | null {
  const normalized = rawStatus.trim().toUpperCase();
  if (DELIVERED_STATUSES.has(normalized)) return "Delivered";
  if (IN_TRANSIT_STATUSES.has(normalized)) return "Out for Delivery";
  if (CANCELLED_STATUSES.has(normalized) || RTO_STATUSES.has(normalized)) return "Cancelled";
  return null;
}