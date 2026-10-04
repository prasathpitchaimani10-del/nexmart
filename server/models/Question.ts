import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  productId: string;
  userId: string;
  userName: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String },
    answeredBy: { type: String },
    answeredAt: { type: Date },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const QuestionModel = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
