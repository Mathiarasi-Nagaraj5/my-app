import mongoose, { Schema, Document, Model } from "mongoose";

export type DiscountType = "percentage" | "flat";

export interface IPromoCode extends Document {
  code: string;                  // e.g. "SUMMER20" — stored uppercase, unique
  description: string;           // internal note e.g. "20% off summer sale"
  discountType: DiscountType;    // "percentage" | "flat"
  discountValue: number;         // 20 → 20% or ₹20
  minOrderValue: number;         // minimum cart value to apply, 0 = no minimum
  maxUses: number;               // 0 = unlimited
  usedCount: number;             // how many times it has been redeemed
  isActive: boolean;             // can be toggled without deleting
  expiresAt: Date | null;        // null = never expires
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "flat"],
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: 0, min: 0 },   // 0 = unlimited
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual: is this code still usable right now?
PromoCodeSchema.virtual("isValid").get(function (this: IPromoCode) {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) return false;
  return true;
});

const PromoCode: Model<IPromoCode> =
  mongoose.models.PromoCode ??
  mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);

export default PromoCode;