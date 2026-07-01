const mongoose = require("mongoose");

const { Schema } = mongoose;

const ActivityLogSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: "activitylogs-pancake" }
);

module.exports =
  mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
