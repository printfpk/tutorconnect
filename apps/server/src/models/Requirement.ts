import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  REQUIREMENT_STATUS, TEACHING_MODES, DAYS_OF_WEEK,
  type RequirementStatus, type TeachingMode, type DayOfWeek,
} from '../config/constants.js';

export interface IRequirement extends Document {
  _id: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;     // parent or student
  subject: string;
  className: string;                     // e.g. "Class 10"
  board: string;                         // e.g. "CBSE", "ICSE"
  teachingMode: TeachingMode;
  location?: {
    type: 'Point';
    coordinates: [number, number];       // [lng, lat]
    address?: string;
    pincode?: string;
  };
  schedule: {
    days: DayOfWeek[];
    preferredTime: string;               // e.g. "6 PM"
    sessionsPerWeek: number;
  };
  budgetMin: number;
  budgetMax: number;
  budgetType: 'monthly' | 'hourly';
  isNegotiable: boolean;
  description?: string;
  status: RequirementStatus;
  interestedTutors: mongoose.Types.ObjectId[];
  offersReceived: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const requirementSchema = new Schema<IRequirement>(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    board: { type: String, required: true, trim: true, default: 'CBSE' },
    teachingMode: {
      type: String,
      enum: Object.values(TEACHING_MODES),
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: { type: [Number] },
      address: { type: String },
      pincode: { type: String },
    },
    schedule: {
      days: [{ type: String, enum: DAYS_OF_WEEK }],
      preferredTime: { type: String, default: 'Flexible' },
      sessionsPerWeek: { type: Number, default: 3, min: 1, max: 7 },
    },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    budgetType: { type: String, enum: ['monthly', 'hourly'], default: 'monthly' },
    isNegotiable: { type: Boolean, default: true },
    description: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: Object.values(REQUIREMENT_STATUS),
      default: REQUIREMENT_STATUS.OPEN,
    },
    interestedTutors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    offersReceived: { type: Number, default: 0 },
    expiresAt: { type: Date },
  },
  { timestamps: true, toJSON: { transform(_doc, ret) { delete ret.__v; return ret; } } }
);

requirementSchema.index({ location: '2dsphere' });
requirementSchema.index({ postedBy: 1 });
requirementSchema.index({ status: 1 });
requirementSchema.index({ subject: 1 });
requirementSchema.index({ createdAt: -1 });

export const Requirement: Model<IRequirement> = mongoose.model<IRequirement>('Requirement', requirementSchema);
