export const DEFAULT_ITEM_WEIGHT_KG = 0.15;
export const MIN_PACKAGE_WEIGHT_KG = 0.1;

export const DEFAULT_PACKAGE_DIMENSIONS_CM = {
  length: 30,
  breadth: 25,
  height: 3,
};

export function computePackageWeightKg(totalItemQuantity: number): number {
  const weight = DEFAULT_ITEM_WEIGHT_KG * Math.max(totalItemQuantity, 1);
  return Math.max(weight, MIN_PACKAGE_WEIGHT_KG);
}