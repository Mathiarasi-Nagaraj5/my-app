import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  productId: string;
  orderId: mongoose.Types.ObjectId;
  userId: string;
  customerName: string;
  rating: number; // 1–5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// one review per (order, product) pair — stops someone reviewing the same
// purchased item twice
ReviewSchema.index({ orderId: 1, productId: 1 }, { unique: true });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;