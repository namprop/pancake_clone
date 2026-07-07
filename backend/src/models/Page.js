const mongoose = require("mongoose");

const { Schema } = mongoose;

const PageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pageId: { type: String, required: true, unique: true },
    pageName: { type: String, required: true },
    pageAvatar: { type: String },
    pageAccessToken: { type: String, required: true },
    tokenExpiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
    lastSyncedAt: { type: Date },
    lastSyncStatus: {
      type: String,
      enum: ["idle", "running", "success", "error"],
      default: "idle",
    },
    lastSyncError: { type: String, default: "" },
  },
  { timestamps: true, collection: "pages-pancake" }
);

module.exports = mongoose.models.Page || mongoose.model("Page", PageSchema);
