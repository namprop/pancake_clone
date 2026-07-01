import mongoose, { Schema, type Model } from "mongoose";

export interface IPage {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pageId: string;
  pageName: string;
  pageAvatar?: string;
  pageAccessToken: string; // encrypted
  tokenExpiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pageId: { type: String, required: true, unique: true },
    pageName: { type: String, required: true },
    pageAvatar: { type: String },
    pageAccessToken: { type: String, required: true },
    tokenExpiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "pages-pancake" }
);

export const Page: Model<IPage> =
  mongoose.models.Page ?? mongoose.model<IPage>("Page", PageSchema);
