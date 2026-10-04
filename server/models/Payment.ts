import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  paymentMethod: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    provider: { type: String, default: 'sandbox_gateway' },
    paymentMethod: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
