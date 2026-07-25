import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReturn extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  userId?: string;
  customerName: string;
  reason: string;
  note?: string;
  amount: number;
  paymentMethod: "upi" | "card" | "cod";
  status: "requested" | "approved" | "rejected" | "refunded";
  razorpayRefundId?: string;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnSchema: Schema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    userId: { type: String, index: true },
    customerName: { type: String, required: true },
    reason: { type: String, required: true },
    note: { type: String },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["upi", "card", "cod"], required: true },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "refunded"],
      default: "requested",
    },
    razorpayRefundId: { type: String },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Return: Model<IReturn> =
  mongoose.models.Return || mongoose.model<IReturn>("Return", ReturnSchema);

export default Return;