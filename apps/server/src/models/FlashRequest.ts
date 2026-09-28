import mongoose, { Schema, Document, Model } from 'mongoose';
import { FLASH_STATUS, type FlashStatus } from '../config/constants.js';

export interface IFlashRequest extends Document {
  _id: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;       // parent / student
  subject: string;
  className: string;
  board: string;
  location: {
    type: 'Point';
    coordinates: [number, number];         // [lng, lat]
    address?: string;
  };
  sessionDurationHours: number;
  ratePerSession: number;
  startsAt: Date;                          // actual scheduled start time
  status: FlashStatus;
  respondedTutors: mongoose.Types.ObjectId[];
  selectedTutor?: mongoose.Types.ObjectId;
  notes?: string;
  expiresAt: Date;                         // auto-expires if not accepted
  createdAt: Date;
  updatedAt: Date;
}

const flashRequestSchema = new Schema<IFlashRequest>(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    board: { type: String, default: 'CBSE', trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: { type: [Number], required: true },
      address: { type: String },
    },
    sessionDurationHours: { type: Number, required: true, min: 0.5, max: 6 },
    ratePerSession: { type: Number, required: true, min: 50 },
    startsAt: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(FLASH_STATUS),
      default: FLASH_STATUS.SEARCHING,
    },
    respondedTutors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    selectedTutor: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, maxlength: 500 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { delete ret.__v; return ret; } } }
);

flashRequestSchema.index({ location: '2dsphere' });
flashRequestSchema.index({ postedBy: 1 });
flashRequestSchema.index({ status: 1 });
flashRequestSchema.index({ startsAt: 1 });
flashRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export const FlashRequest: Model<IFlashRequest> = mongoose.model<IFlashRequest>('FlashRequest', flashRequestSchema);
