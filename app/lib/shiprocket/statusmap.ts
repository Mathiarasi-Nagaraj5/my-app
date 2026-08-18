// Shiprocket's webhook sends its own free-text/status-code system, which
// doesn't map 1:1 onto our 5-state Order.status. This is the single place
// that translation happens, so it can't drift between the webhook handler
// and anywhere else that might need it (e.g. a future manual sync route).
//
// Shiprocket's shipment_status values (numeric) — from their docs, subject
// to them adding more over time. Unknown codes fall through to "unmapped"
// and we still log the raw status in statusHistory without changing
// order.status, rather than guessing wrong.
export type OrderStatus = "Confirmed" | "In Transit" | "Delivered" | "Cancelled" | "Returned";

const IN_TRANSIT_STATUSES = new Set([
  "SHIPPED",
  "IN TRANSIT",
  "OUT FOR DELIVERY",
  "OUT FOR PICKUP",
  "PICKED UP",
  "REACHED AT DESTINATION HUB",
]);

const DELIVERED_STATUSES = new Set(["DELIVERED"]);

const CANCELLED_STATUSES = new Set(["CANCELLED", "CANCELED"]);

// RTO (return-to-origin, courier-initiated) is deliberately NOT mapped to
// our customer-initiated "Returned" status — those are different flows
// (one is the courier failing to deliver, the other is the return-request
// system we built earlier). Surfacing RTO as "Cancelled" is the closest
// honest fit until you want a dedicated RTO state.
const RTO_STATUSES = new Set([
  "RTO INITIATED",
  "RTO IN TRANSIT",
  "RTO DELIVERED",
]);

export function mapShiprocketStatusToOrderStatus(rawStatus: string): OrderStatus | null {
  const normalized = rawStatus.trim().toUpperCase();

  if (DELIVERED_STATUSES.has(normalized)) return "Delivered";
  if (IN_TRANSIT_STATUSES.has(normalized)) return "In Transit";
  if (CANCELLED_STATUSES.has(normalized) || RTO_STATUSES.has(normalized)) return "Cancelled";

  return null; // unmapped — log the raw event, don't change order.status
}