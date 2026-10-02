import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phone?: string;
  passwordHash?: string; // optional now — Google-only accounts never set one
  provider: "credentials" | "google";
  googleId?: string;
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    passwordHash: { type: String }, // was required: true — Google accounts have none
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;