import mongoose, { Schema } from "mongoose";
import type { InferSchemaType, Model } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    inquiryType: { type: String, required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

type ContactMessageDoc = InferSchemaType<typeof ContactMessageSchema>;

const ContactMessage: Model<ContactMessageDoc> =
  (mongoose.models.ContactMessage as Model<ContactMessageDoc> | undefined) ??
  mongoose.model<ContactMessageDoc>("ContactMessage", ContactMessageSchema);

export default ContactMessage;