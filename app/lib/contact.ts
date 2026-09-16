// Server-side only until something needs it in a client component — pass
// the value down as a prop instead of reading process.env directly inside
// "use client" files, since only NEXT_PUBLIC_-prefixed vars reach the browser.
export const CONTACT_NUMBER = process.env.CONTACT_NUMBER || ""; // digits with country code, e.g. "919876543210"
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "";
export const CONTACT_ADDRESS = process.env.CONTACT_ADDRESS || "";

export function buildWhatsAppLink(message: string, number: string = CONTACT_NUMBER): string {
  const clean = number.replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}