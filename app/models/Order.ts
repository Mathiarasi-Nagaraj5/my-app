import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IShipment {
  shiprocketOrderId?: string;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  shippedAt?: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: "upi" | "card" | "cod";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  subtotal: number;
  delivery: number;
  total: number;
  status: "confirmed" | "in transit" | "delivered" | "cancelled";
  shipment?: IShipment;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
  },
  { _id: false }
);

const ShippingAddressSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const ShipmentSchema: Schema = new Schema(
  {
    shiprocketOrderId: { type: String },
    awbCode: { type: String },
    courierName: { type: String },
    trackingUrl: { type: String },
    shippedAt: { type: Date },
  },
  { _id: false }
);

function generateOrderNumber() {
  return `ES${Math.floor(1000 + Math.random() * 9000)}`;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: generateOrderNumber,
    },
    userId: { type: String, index: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ["upi", "card", "cod"], required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    subtotal: { type: Number, required: true },
    delivery: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["confirmed", "in transit", "delivered", "cancelled"],
      default: "confirmed",
    },
    shipment: { type: ShipmentSchema, default: undefined },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;