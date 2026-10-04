export type UserRole = 'customer' | 'admin';

export interface IAddress {
  _id?: string;
  name: string;
  phone: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'home' | 'work' | 'other';
  isDefault: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  addresses: IAddress[];
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
}

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

export interface IProduct {
  _id: string;
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
  createdAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: string[];
  productCount: number;
}

export interface ICartItem {
  product: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  variantSku?: string;
  variantTitle?: string;
  price: number;
  originalPrice: number;
  quantity: number;
  stock: number;
  isOutOfStock: boolean;
  savedForLater: boolean;
  itemTotal: number;
}

export interface ICartData {
  items: ICartItem[];
  savedForLater: ICartItem[];
  itemCount: number;
  subtotal: number;
  originalTotal: number;
  productDiscount: number;
  estimatedDeliveryFee: number;
  estimatedTax: number;
  estimatedTotal: number;
}

export interface ICoupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

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
  timestamp: string;
  note: string;
}

export type OrderStatus =
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

export interface IOrder {
  _id: string;
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
    paidAt?: string;
  };
  orderStatus: OrderStatus;
  trackingHistory: ITrackingEvent[];
  cancellationReason?: string;
  returnDetails?: {
    reason: string;
    description: string;
    images?: string[];
    requestedAt: string;
    status: 'requested' | 'approved' | 'rejected' | 'completed';
  };
  refundDetails?: {
    amount: number;
    reason: string;
    refundId: string;
    refundedAt: string;
    status: 'pending' | 'processed';
  };
  invoiceNumber: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface IQuestion {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'order' | 'account' | 'operational';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  meta?: Record<string, any>;
}
