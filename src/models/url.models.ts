import { Schema, model, SchemaTypes } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface IUrl extends Document {
  originalUrl: string;
  shortUrl?: string;
  customUrl?: string;
  password?: string;
  isPasswordEnabled: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  totalClicks: number;
  user?: string;
  qr: string;
}

// 2. Create a Schema corresponding to the document interface.
const urlSchema = new Schema<IUrl>(
  {
    user: { type: SchemaTypes.ObjectId, ref: "User" },
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, sparse: true, index: true },
    password: { type: String },
    expiresAt: { type: Date },
    totalClicks: { type: Number, default: 0 },
    customUrl: { type: String, sparse: true, index: true },
    isPasswordEnabled: { type: Boolean, default: false },
    qr: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 3. Create a Model.
export const UrlModel = model<IUrl>("Url", urlSchema);
