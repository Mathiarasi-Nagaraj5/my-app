import mongoose, { Schema, models, model } from "mongoose";

export interface AddressDocument extends mongoose.Document {
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<AddressDocument>(
  {
    userId: { type: String, required: true, index: true },
    label: { type: String, default: "home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    // include Mongoose's automatic `id` virtual in JSON output — same fix
    // applied to Product.ts, so address.id works if you ever need it
    // alongside address._id
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default models.Address || model<AddressDocument>("Address", AddressSchema);