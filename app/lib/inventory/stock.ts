import Product from "@/app/models/Product";

export interface StockItem {
  productId: string;
  quantity: number;
}

/**
 * Atomically decrements stock for each item. Each decrement is its own
 * conditional update (stock >= quantity in the filter) — this is what
 * prevents two concurrent orders from both succeeding for the last unit,
 * same principle as PromoCode.reserve().
 *
 * If any item fails (out of stock, product deleted mid-request), every
 * item successfully decremented so far in THIS call is rolled back before
 * returning — an order should never partially reserve stock.
 */
export async function decrementStock(items: StockItem[]): Promise<
  { ok: true } | { ok: false; failedProductId: string }
> {
  const decremented: StockItem[] = [];

  for (const item of items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );

    if (!result) {
      // This item failed — roll back everything decremented so far in this call.
      await restoreStock(decremented);
      return { ok: false, failedProductId: item.productId };
    }

    decremented.push(item);
  }

  return { ok: true };
}

/**
 * Adds stock back — used both for the rollback above and for order
 * cancellation / accepted returns. Not conditional (no floor check needed
 * going up), but still a single atomic $inc per item rather than
 * read-then-write, so concurrent restores can't clobber each other.
 */
export async function restoreStock(items: StockItem[]): Promise<void> {
  for (const item of items) {
    await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
  }
}