export interface GstLineBreakdown {
  taxableValue: number;
  taxRate: number;
  taxAmount: number;
  grossValue: number;
}

export function computeGstForItem(unitPrice: number, quantity: number): GstLineBreakdown {
  const taxRate = unitPrice <= 1000 ? 5 : 12;
  const grossValue = unitPrice * quantity;
  const taxableValue = Math.round((grossValue / (1 + taxRate / 100)) * 100) / 100;
  const taxAmount = Math.round((grossValue - taxableValue) * 100) / 100;
  return { taxableValue, taxRate, taxAmount, grossValue };
}

export interface GstSplit {
  isIntraState: boolean;
  cgst: number;
  sgst: number;
  igst: number;
}

// Normalizes both sides before comparing — strips spaces/case so
// "Tamil Nadu", "tamilnadu", and "TAMIL NADU" are all treated as the same
// state. Without this, a customer typing the state slightly differently
// than BUSINESS_STATE wrongly triggers IGST instead of CGST+SGST for an
// order that's actually intra-state — a real bug, not just cosmetic, since
// it affects which tax fields get filed under.
function normalizeState(state: string): string {
  return state.trim().toLowerCase().replace(/\s+/g, "");
}

export function splitGst(totalTax: number, shippingState: string): GstSplit {
  const businessState = process.env.BUSINESS_STATE || "";
  const isIntraState = normalizeState(shippingState) === normalizeState(businessState);

  if (isIntraState) {
    const half = Math.round((totalTax / 2) * 100) / 100;
    return { isIntraState: true, cgst: half, sgst: totalTax - half, igst: 0 };
  }
  return { isIntraState: false, cgst: 0, sgst: 0, igst: totalTax };
}