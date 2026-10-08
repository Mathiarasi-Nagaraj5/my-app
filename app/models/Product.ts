import mongoose, { Schema, models, model } from "mongoose";

export interface ProductAttribute {
  label: string;
  value: string;
}

export interface ProductDocument extends mongoose.Document {
  slug: string;
  sku: string;
  name: string;
  category: string[];
  description?: string;

  // Specifications
  material?: string;        // e.g. "100% Cotton"
  fit?: string;             // Regular, Oversized, Relaxed
  neck?: string;            // Round Neck, V-Neck
  sleeveLength?: string;    // Short Sleeves, Long Sleeves
  pattern?: string;         // Typography, Graphic, Solid
  occasion?: string;        // Casual, Lounge
  packOf?: number;          // 1, 2
  washCare?: string;        // "Machine wash, do not bleach"
  sizeAndFit?: string;      // "Model is 5'6" and wears size XL"
  highlights?: string[];    // short bullet points
  attributes?: ProductAttribute[]; // anything else, per product type

  price: number;
  originalPrice?: number;
  stock: number;
  imageUrls: string[];
  colors?: string[];
  sizes?: string[];
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttributeSchema = new Schema<ProductAttribute>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<ProductDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: [String], required: true, index: true },
    description: { type: String, trim: true },

    material: { type: String, trim: true },
    fit: { type: String, trim: true, index: true },
    neck: { type: String, trim: true },
    sleeveLength: { type: String, trim: true },
    pattern: { type: String, trim: true, index: true },
    occasion: { type: String, trim: true },
    packOf: { type: Number, min: 1, default: 1 },
    washCare: { type: String, trim: true },
    sizeAndFit: { type: String, trim: true },
    highlights: { type: [String], default: [] },
    attributes: { type: [AttributeSchema], default: [] },

    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },

    imageUrls: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length >= 1 && arr.length <= 5,
        message: "A product must have between 1 and 5 imageUrls",
      },
    },

    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isBestseller: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default models.Product ||
  model<ProductDocument>("Product", ProductSchema);