import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  user: string;
  products: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: { type: String, required: true, unique: true, index: true },
    products: [{ type: String }],
  },
  { timestamps: true }
);

export const WishlistModel =
  mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);
