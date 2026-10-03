export const INQUIRY_TYPES = [
  "Product & General Enquiry",
  "Order & Delivery Support",
  "Returns & Refunds",
  "Bulk / Corporate Orders",
  "Other",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

export function isInquiryType(value: unknown): value is InquiryType {
  return (
    typeof value === "string" &&
    (INQUIRY_TYPES as readonly string[]).includes(value)
  );
}