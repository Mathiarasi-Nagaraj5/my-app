import mongoose, { Schema, Document, Model } from "mongoose";
import { RETURN_REASONS } from "@/app/lib/returns";

export type ReturnStatus = "Pending" | "Accepted" | "Rejected";
export type RefundStatus = "NotApplicable" | "Pending" | "Completed" | "Failed";
export type RefundMethod = "razorpay" | "manual" | null;

export interface IReturnRefund {
  razorpayRefundId?: string;
  amount: number;
  refundedAt: Date;
  note?: string;
}

export interface IReverseShipment {
  shiprocketOrderId?: number;
  awbCode?: string;
  scheduledAt?: Date;
  failedReason?: string;
}

export interface IReturnRequest extends Document {
  orderId: string;
  orderNumber: string;
  userId?: string;
  reason: string;
  otherReason?: string;
  status: ReturnStatus;
  adminNote?: string;
  refundStatus: RefundStatus;
  refundMethod: RefundMethod;
  refund?: IReturnRefund;
  reverseShipment?: IReverseShipment;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema: Schema = new Schema(
  {
    razorpayRefundId: { type: String },
    amount: { type: Number, required: true },
    refundedAt: { type: Date, required: true },
    note: { type: String },
  },
  { _id: false }
);

const ReverseShipmentSchema: Schema = new Schema(
  {
    shiprocketOrderId: { type: Number },
    awbCode: { type: String },
    scheduledAt: { type: Date },
    failedReason: { type: String },
  },
  { _id: false }
);

const ReturnRequestSchema = new Schema<IReturnRequest>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true },
    userId: { type: String, index: true },
    reason: { type: String, required: true, enum: RETURN_REASONS },
    otherReason: { type: String },
    status: { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
    adminNote: { type: String },
    refundStatus: {
      type: String,
      enum: ["NotApplicable", "Pending", "Completed", "Failed"],
      default: "NotApplicable",
    },
    refundMethod: { type: String, enum: ["razorpay", "manual", null], default: null },
    refund: { type: RefundSchema, default: undefined },
    reverseShipment: { type: ReverseShipmentSchema, default: undefined },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ReturnRequest: Model<IReturnRequest> =
  mongoose.models.ReturnRequest || mongoose.model<IReturnRequest>("ReturnRequest", ReturnRequestSchema);

export default ReturnRequest;