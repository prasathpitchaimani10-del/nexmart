import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant {
  sku: string;
  title: string;
  size?: string;
  color?: string;
  capacity?: string;
  price: number;
  originalPrice: number;
  stock: number;
  images?: string[];
}

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProductImage {
  url: string;
  publicId?: string;
  isMain?: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  images: IProductImage[];
  video?: string;
  specifications: ISpecification[];
  variants: IVariant[];
  pricing: {
    price: number;
    originalPrice: number;
    discountPercentage: number;
  };
  stock: number;
  sku: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        isMain: { type: Boolean, default: false },
      },
    ],
    video: { type: String, default: '' },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    variants: [
      {
        sku: { type: String, required: true },
        title: { type: String, required: true },
        size: { type: String },
        color: { type: String },
        capacity: { type: String },
        price: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
        stock: { type: Number, required: true, default: 0 },
        images: [{ type: String }],
      },
    ],
    pricing: {
      price: { type: Number, required: true },
      originalPrice: { type: Number, required: true },
      discountPercentage: { type: Number, default: 0 },
    },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', brand: 'text' });

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
