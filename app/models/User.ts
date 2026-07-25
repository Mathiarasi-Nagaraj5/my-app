import mongoose, { Schema, models, model } from "mongoose";

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string; // never store plain passwords — hash with bcrypt before saving
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.User || model<UserDocument>("User", UserSchema);
