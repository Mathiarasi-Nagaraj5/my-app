export const RETURN_WINDOW_DAYS = 7;

export const RETURN_REASONS = [
  "Wrong size delivered",
  "Wrong item delivered",
  "Product damaged or defective",
  "Product not as described",
  "Changed my mind",
  "Other",
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number];

interface EligibilityInput {
  status: string;
  deliveredAt?: Date | string | null;
}

/**
 * Single source of truth for "can this order be returned right now?" —
 * used both to show/hide the Return button on the client and to validate
 * the actual POST /api/returns request server-side. Never trust the
 * client-side check alone; the server re-runs this on every submission.
 */
export function isReturnEligible(order: EligibilityInput): { eligible: boolean; reason?: string } {
  if (order.status !== "Delivered") {
    return { eligible: false, reason: "this order hasn't been delivered yet" };
  }
  if (!order.deliveredAt) {
    return { eligible: false, reason: "delivery date not recorded for this order" };
  }
  const deliveredAt = new Date(order.deliveredAt);
  const deadline = new Date(deliveredAt.getTime() + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  if (new Date() > deadline) {
    return { eligible: false, reason: `the ${RETURN_WINDOW_DAYS}-day return window has expired` };
  }
  return { eligible: true };
}