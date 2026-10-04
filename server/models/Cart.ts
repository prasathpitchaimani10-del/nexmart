import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: string;
  variantSku?: string;
  quantity: number;
  savedForLater?: boolean;
}

export interface ICart extends Document {
  user: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: String, required: true },
    variantSku: { type: String },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    savedForLater: { type: Boolean, default: false },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: String, required: true, unique: true, index: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export const CartModel = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
