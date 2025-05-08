import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  title: string;
  description: string;
  requestedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'purchased' | 'delivered';
  priority: 'low' | 'medium' | 'high';
  price?: number;
  quantity: number;
  url?: string;
  comments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'purchased', 'delivered'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    price: { type: Number },
    quantity: { type: Number, required: true, default: 1 },
    url: { type: String },
    comments: [{ type: String }],
  },
  { timestamps: true }
);

OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
