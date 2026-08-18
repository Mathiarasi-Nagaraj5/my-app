// Flat defaults for a T-shirt-only catalog: every order ships in the same
// poly-mailer, so we don't need per-product weight/dimensions yet. If the
// catalog later grows to bulkier items (hoodies, multi-item bundles that
// don't fit a mailer), revisit this — Shiprocket rates are priced primarily
// off weight slab, so getting this number right matters more than the
// dimensions do for a small/light catalog.

export const DEFAULT_ITEM_WEIGHT_KG = 0.15; // one T-shirt, packaged
export const MIN_PACKAGE_WEIGHT_KG = 0.1; // Shiprocket won't quote below this reliably

export const DEFAULT_PACKAGE_DIMENSIONS_CM = {
  length: 30,
  breadth: 25,
  height: 3,
};

export function computePackageWeightKg(totalItemQuantity: number): number {
  const weight = DEFAULT_ITEM_WEIGHT_KG * Math.max(totalItemQuantity, 1);
  return Math.max(weight, MIN_PACKAGE_WEIGHT_KG);
}