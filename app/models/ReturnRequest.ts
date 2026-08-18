import mongoose, { Schema, Document, Model } from "mongoose";
import { RETURN_REASONS } from "@/app/lib/returns";

export type ReturnStatus = "Pending" | "Accepted" | "Rejected";

export interface IReturnRequest extends Document {
  orderId: string;
  orderNumber: string;
  userId?: string;
  reason: string;
  otherReason?: string;
  status: ReturnStatus;
  adminNote?: string;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnRequestSchema = new Schema<IReturnRequest>(
  {
    // unique: one return request per order, ever. A rejected request
    // can't be resubmitted for the same order — the admin decision is final.
    orderId: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true },
    userId: { type: String, index: true },
    reason: { type: String, required: true, enum: RETURN_REASONS },
    otherReason: { type: String },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    adminNote: { type: String },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ReturnRequest: Model<IReturnRequest> =
  mongoose.models.ReturnRequest || mongoose.model<IReturnRequest>("ReturnRequest", ReturnRequestSchema);

export default ReturnRequest;