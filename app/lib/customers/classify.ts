export type CustomerTag = "good" | "new" | "watch" | "risk";

export interface CustomerStats {
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  cancelledCodOrders: number;
}

// Central place for the good/bad-customer thresholds — change the numbers
// here if the client gives different criteria, nothing else needs to change.
export function classifyCustomer(stats: CustomerStats): CustomerTag {
  const { deliveredOrders, returnedOrders, cancelledCodOrders } = stats;
  const returnRate = deliveredOrders > 0 ? returnedOrders / deliveredOrders : 0;

  if (cancelledCodOrders >= 2 || returnRate >= 0.5) return "risk";
  if (cancelledCodOrders >= 1 || (returnRate >= 0.2 && returnRate < 0.5)) return "watch";
  if (deliveredOrders >= 3 && returnRate < 0.2) return "good";
  return "new";
}

export const TAG_LABELS: Record<CustomerTag, string> = {
  good: "Good",
  new: "New",
  watch: "Watch",
  risk: "Risk",
};

export const TAG_STYLES: Record<CustomerTag, string> = {
  good: "bg-green-100 text-green-700",
  new: "bg-blue-100 text-blue-700",
  watch: "bg-amber-100 text-amber-700",
  risk: "bg-red-100 text-red-700",
};