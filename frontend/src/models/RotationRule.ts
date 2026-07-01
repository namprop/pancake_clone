import mongoose, { Schema, type Model } from "mongoose";

const RotationRuleSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true },
    assignedUsers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        weight: { type: Number, default: 1 }, // Defines how many leads they get relative to others
      }
    ],
    workingHours: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "17:30" },
      timezone: { type: String, default: "Asia/Ho_Chi_Minh" }
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'rotationrules-pancake' }
);

export const RotationRule = mongoose.models.RotationRule || mongoose.model("RotationRule", RotationRuleSchema);
