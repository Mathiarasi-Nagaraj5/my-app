export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 79;

export function computeDelivery(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
}