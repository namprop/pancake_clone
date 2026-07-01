import mongoose, { Schema, type Model } from "mongoose";
import type { IUser } from "@/types/user";

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "staff"],
      default: "staff",
    },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace" },
    roleId: { type: Schema.Types.ObjectId, ref: "Role" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'users-pancake' }
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
