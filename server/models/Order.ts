import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './User';

export interface IOrderItem {
  product: string;
  productName: string;
  productImage: string;
  variantSku?: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  originalPrice: number;
  itemTotal: number;
}

export interface ITrackingEvent {
  status: string;
  timestamp: Date;
  note: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: IOrderItem[];
  address: IAddress;
  pricing: {
    subtotal: number;
    productDiscount: number;
    couponDiscount: number;
    tax: number;
    deliveryFee: number;
    total: number;
  };
  couponApplied?: {
    code: string;
    discount: number;
  };
  deliveryMethod: {
    type: 'standard' | 'express';
    title: string;
    estimatedDays: number;
  };
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDetails?: {
    transactionId?: string;
    provider?: string;
    paidAt?: Date;
  };
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'return_requested'
    | 'returned'
    | 'refund_initiated'
    | 'refunded';
  trackingHistory: ITrackingEvent[];
  cancellationReason?: string;
  returnDetails?: {
    reason: string;
    description: string;
    images?: string[];
    requestedAt: Date;
    status: 'requested' | 'approved' | 'rejected' | 'completed';
  };
  refundDetails?: {
    amount: number;
    reason: string;
    refundId: string;
    refundedAt: Date;
    status: 'pending' | 'processed';
  };
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    variantSku: { type: String },
    variantTitle: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    itemTotal: { type: Number, required: true },
  },
  { _id: false }
);

const TrackingEventSchema = new Schema<ITrackingEvent>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      id: { type: String, required: true, index: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [OrderItemSchema],
    address: { type: Object, required: true },
    pricing: {
      subtotal: { type: Number, required: true },
      productDiscount: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    couponApplied: {
      code: { type: String },
      discount: { type: Number },
    },
    deliveryMethod: {
      type: { type: String, enum: ['standard', 'express'], default: 'standard' },
      title: { type: String, default: 'Standard Delivery' },
      estimatedDays: { type: Number, default: 3 },
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      transactionId: { type: String },
      provider: { type: String },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'return_requested',
        'returned',
        'refund_initiated',
        'refunded',
      ],
      default: 'confirmed',
      index: true,
    },
    trackingHistory: [TrackingEventSchema],
    cancellationReason: { type: String },
    returnDetails: {
      reason: { type: String },
      description: { type: String },
      images: [{ type: String }],
      requestedAt: { type: Date },
      status: { type: String, enum: ['requested', 'approved', 'rejected', 'completed'] },
    },
    refundDetails: {
      amount: { type: Number },
      reason: { type: String },
      refundId: { type: String },
      refundedAt: { type: Date },
      status: { type: String, enum: ['pending', 'processed'] },
    },
    invoiceNumber: { type: String, required: true },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
