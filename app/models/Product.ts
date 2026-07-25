import mongoose, { Schema, models, model } from "mongoose";

export interface ProductDocument extends mongoose.Document {
  slug: string;
  name: string;
  category: "t-shirts" | "hoodies" | "pyjamas";
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  images?: string[]; // gallery images, replaces the derived-from-slug placeholder
  isBestseller?: boolean;
  colors?: string[];
  sizes?: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["t-shirts", "hoodies", "pyjamas"],
      index: true,
    },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    imageUrl: { type: String, required: true },
    images: [{ type: String }],
    isBestseller: { type: Boolean, default: false },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    description: { type: String },
  },
  {
    timestamps: true,
    // THE FIX: Mongoose automatically gives every document an `id` virtual
    // (a string version of _id), but it's excluded from JSON output by
    // default — only _id is included. Setting toJSON/toObject virtuals to
    // true includes it, so anywhere this document gets sent as JSON
    // (API responses, NextResponse.json(), etc.) it now has a real `id`
    // field your frontend's Product type already expects.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevents "Cannot overwrite model" errors from Next.js hot-reloading this file
export default models.Product || model<ProductDocument>("Product", ProductSchema);