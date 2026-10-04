import mongoose, { Schema, Document } from 'mongoose';

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

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  isVerified: boolean;
  otp?: {
    code: string;
    expiresAt: Date;
  };
  resetPasswordToken?: {
    token: string;
    expiresAt: Date;
  };
  addresses: IAddress[];
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    houseFlat: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    addressType: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
    isVerified: { type: Boolean, default: false },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    resetPasswordToken: {
      token: { type: String },
      expiresAt: { type: Date },
    },
    addresses: [AddressSchema],
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
