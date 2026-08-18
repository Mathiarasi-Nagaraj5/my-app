import mongoose, { Schema, Document, Model } from "mongoose";

export type DiscountType = "percentage" | "flat";

export interface IPromoCode extends Document {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface IPromoCodeModel extends Model<IPromoCode> {
  reserve(code: string, subtotal: number): Promise<IPromoCode | null>;
  release(code: string): Promise<void>;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    discountType: { type: String, required: true, enum: ["percentage", "flat"] },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: 0, min: 0 }, // 0 = unlimited
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PromoCodeSchema.virtual("isValid").get(function (this: IPromoCode) {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) return false;
  return true;
});

/**
 * Atomically claims one use of a promo code in a single conditional update.
 * Under concurrent checkouts, only one findOneAndUpdate can match the
 * usedCount < maxUses condition for the last slot — the loser gets null,
 * not a coupon. Call this ONLY when about to charge the customer
 * (create-order / COD order creation), never from a read-only preview.
 */
PromoCodeSchema.statics.reserve = async function (
  code: string,
  subtotal: number
): Promise<IPromoCode | null> {
  const now = new Date();
  return this.findOneAndUpdate(
    {
      code: code.trim().toUpperCase(),
      isActive: true,
      minOrderValue: { $lte: subtotal },
      $and: [
        { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] },
        { $or: [{ maxUses: 0 }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }] },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
};

/** Releases a claimed use — call on payment failure/expiry so an abandoned checkout doesn't permanently burn a limited-use code. */
PromoCodeSchema.statics.release = async function (code: string): Promise<void> {
  await this.updateOne(
    { code: code.trim().toUpperCase(), usedCount: { $gt: 0 } },
    { $inc: { usedCount: -1 } }
  );
};

const PromoCode =
  (mongoose.models.PromoCode as IPromoCodeModel) ??
  mongoose.model<IPromoCode, IPromoCodeModel>("PromoCode", PromoCodeSchema);

export default PromoCode;