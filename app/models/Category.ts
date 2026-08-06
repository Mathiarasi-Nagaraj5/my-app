import mongoose, { Schema, models, model } from "mongoose";

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

export default models.Category || model<ICategory>("Category", CategorySchema);