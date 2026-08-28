import mongoose, { Schema, Document, Model } from "mongoose";

export type StockChangeReason = "order-created" | "cancellation-restore" | "return-restore" | "rollback";

export interface IStockLog extends Document {
  productId: string;
  orderId?: string;
  change: number; // negative = decrement, positive = restore
  resultingStock: number;
  reason: StockChangeReason;
  createdAt: Date;
}

const StockLogSchema = new Schema<IStockLog>(
  {
    productId: { type: String, required: true, index: true },
    orderId: { type: String, index: true },
    change: { type: Number, required: true },
    resultingStock: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["order-created", "cancellation-restore", "return-restore", "rollback"],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const StockLog: Model<IStockLog> = mongoose.models.StockLog || mongoose.model<IStockLog>("StockLog", StockLogSchema);
export default StockLog;