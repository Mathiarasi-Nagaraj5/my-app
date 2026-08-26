import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  imageUrls: string[];
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
   email: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IShipmentStatusEvent {
  status: string;
  activity?: string;
  location?: string;
  statusDate: Date;
}

export interface IShipment {
  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  courierId?: number;
  courierName?: string;
  awbCode?: string;
  currentStatus?: string; // Shiprocket's raw current_status string
  trackingUrl?: string;
  labelUrl?: string;
  manifestUrl?: string;
  packageWeightKg?: number; // what was actually sent, for audit/debugging
  pickupScheduledAt?: Date;
  shippedAt?: Date;
  statusHistory?: IShipmentStatusEvent[];
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: "upi" | "card" | "cod";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  subtotal: number;
  delivery: number;
  promoCode: string | null;
  discount: number;
  total: number;
  status: "Confirmed" | "In Transit" | "Delivered" | "Cancelled" | "Returned";
   refund?: IRefund;
  shipment?: IShipment;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}
export interface IRefund {
  razorpayRefundId?: string;
  amount: number;
  refundedAt: Date;
}
const OrderItemSchema: Schema = new Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    imageUrls: { type: [String] },
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
     email: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);
const RefundSchema: Schema = new Schema(
  {
    razorpayRefundId: { type: String }, // no longer required: true
    amount: { type: Number, required: true },
    refundedAt: { type: Date, required: true },
  },
  { _id: false }
);
const ShipmentStatusEventSchema: Schema = new Schema(
  {
    status: { type: String, required: true },
    activity: { type: String },
    location: { type: String },
    statusDate: { type: Date, required: true },
  },
  { _id: false }
);

const ShipmentSchema: Schema = new Schema(
  {
    shiprocketOrderId: { type: Number },
    shiprocketShipmentId: { type: Number },
    courierId: { type: Number },
    courierName: { type: String },
    awbCode: { type: String },
    currentStatus: { type: String },
    trackingUrl: { type: String },
    labelUrl: { type: String },
    manifestUrl: { type: String },
    packageWeightKg: { type: Number },
    pickupScheduledAt: { type: Date },
    shippedAt: { type: Date },
    statusHistory: { type: [ShipmentStatusEventSchema], default: [] },
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
    refund: { type: RefundSchema, default: undefined },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    subtotal: { type: Number, required: true },
    delivery: { type: Number, required: true, default: 0 },
    promoCode: { type: String, default: null },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Confirmed", "In Transit", "Delivered", "Cancelled", "Returned"],
      default: "Confirmed",
    },
    deliveredAt: {
      type: Date,
      default: undefined,
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