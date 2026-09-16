// File: app/models/Review.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  productId: string;
  orderId?: mongoose.Types.ObjectId; // absent for admin-added reviews
  userId: string; // "admin" for admin-added reviews
  customerName: string;
  rating: number; // 1–5
  comment: string;
  images: string[];
  isVisible: boolean; // admin show/hide toggle
  source: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" }, // no longer required — admin reviews have none
    userId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: { type: [String], default: [] },
    isVisible: { type: Boolean, default: true },
    source: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One review per (order, product) pair — stops a customer reviewing the same
// purchased item twice. Only enforced when orderId actually exists, so
// admin-added reviews (no orderId) never collide with each other here.
ReviewSchema.index(
  { orderId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { orderId: { $exists: true } } }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;