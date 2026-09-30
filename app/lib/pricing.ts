export const COD_FEE = 15;

// Delivery is free for all orders
export function computeDelivery(_subtotal?: number): number {
  return 0;
}

export function computeCodFee(method: string): number {
  return method === "cod" ? COD_FEE : 0;
}