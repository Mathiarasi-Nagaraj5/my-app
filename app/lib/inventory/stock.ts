import Product from "@/app/models/Product";
import StockLog, { StockChangeReason } from "@/app/models/StockLog";
import { LOW_STOCK_THRESHOLD } from "./constant";
import { sendLowStockAlert } from "@/app/lib/email/send";

export interface StockItem {
  productId: string;
  quantity: number;
}

export interface StockContext {
  reason: StockChangeReason;
  orderId?: string;
}

export async function decrementStock(
  items: StockItem[],
  context: StockContext
): Promise<{ ok: true } | { ok: false; failedProductId: string }> {
  const decremented: StockItem[] = [];

  for (const item of items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!result) {
      await restoreStock(decremented, { reason: "rollback", orderId: context.orderId });
      return { ok: false, failedProductId: item.productId };
    }

    decremented.push(item);

    try {
      await StockLog.create({
        productId: item.productId,
        orderId: context.orderId,
        change: -item.quantity,
        resultingStock: result.stock,
        reason: context.reason,
      });
    } catch (err) {
      console.error("StockLog write failed (non-blocking):", err);
    }

    if (result.stock <= LOW_STOCK_THRESHOLD) {
      sendLowStockAlert(result.name, result.stock).catch(() => {
        /* already logged inside sendLowStockAlert */
      });
    }
  }

  return { ok: true };
}

export async function restoreStock(items: StockItem[], context: StockContext): Promise<void> {
  for (const item of items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.productId },
      { $inc: { stock: item.quantity } },
      { new: true }
    );
    if (!result) continue;

    try {
      await StockLog.create({
        productId: item.productId,
        orderId: context.orderId,
        change: item.quantity,
        resultingStock: result.stock,
        reason: context.reason,
      });
    } catch (err) {
      console.error("StockLog write failed (non-blocking):", err);
    }
  }
}