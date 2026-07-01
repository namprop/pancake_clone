import mongoose, { Schema, type Model } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., 'UPDATE_SETTINGS', 'CREATE_ORDER'
    entityType: { type: String }, // e.g., 'Workspace', 'Order'
    entityId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed }, // JSON dump of changes
  },
  { timestamps: true, collection: 'activitylogs-pancake' }
);

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
