const mongoose = require("mongoose");

const { Schema } = mongoose;

const RotationRuleSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true },
    assignedUsers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        weight: { type: Number, default: 1 },
      },
    ],
    workingHours: {
      start: { type: String, default: "08:00" },
      end: { type: String, default: "17:30" },
      timezone: { type: String, default: "Asia/Ho_Chi_Minh" },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "rotationrules-pancake" }
);

module.exports =
  mongoose.models.RotationRule || mongoose.model("RotationRule", RotationRuleSchema);
