import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId?: string; // empty means broadcast or admin
  title: string;
  message: string;
  type: 'order' | 'account' | 'operational';
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, default: '', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['order', 'account', 'operational'], default: 'order' },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
