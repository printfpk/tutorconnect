import mongoose, { Schema, Document, Model } from 'mongoose';
import { OFFER_STATUS, type OfferStatus } from '../config/constants.js';

export interface IOffer extends Document {
  _id: mongoose.Types.ObjectId;
  requirement: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  proposedRate: number;
  message?: string;
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    requirement: { type: Schema.Types.ObjectId, ref: 'Requirement', required: true },
    tutor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    proposedRate: { type: Number, required: true, min: 0 },
    message: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: Object.values(OFFER_STATUS),
      default: OFFER_STATUS.PENDING,
    },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { delete ret.__v; return ret; } } }
);

offerSchema.index({ requirement: 1, tutor: 1 }, { unique: true });
offerSchema.index({ tutor: 1 });
offerSchema.index({ requirement: 1 });
offerSchema.index({ status: 1 });

export const Offer: Model<IOffer> = mongoose.model<IOffer>('Offer', offerSchema);
