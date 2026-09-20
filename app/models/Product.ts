import mongoose, { Schema, models, model } from "mongoose";

export interface ProductDocument extends mongoose.Document {
  slug: string;
  sku: string;
  name: string;

  category: string[];

  description?: string;

  material?: string;
  style?: string;

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

const ProductSchema = new Schema<ProductDocument>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: [String],
      required: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    material: {
      type: String,
      trim: true,
    },

    style: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    originalPrice: {
      type: Number,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    imageUrls: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) =>
          arr.length >= 1 && arr.length <= 5,
        message: "A product must have between 1 and 5 imageUrls",
      },
    },

    colors: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

export default models.Product ||
  model<ProductDocument>("Product", ProductSchema);