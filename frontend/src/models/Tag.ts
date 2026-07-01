import mongoose, { Schema, type Model } from "mongoose";

const TagSchema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: "#3b82f6" }, // Hex color
    order: { type: Number, default: 0 },
    description: { type: String },
    isInactive: { type: Boolean, default: false },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true, collection: 'tags-pancake' }
);

// Bypass Next.js hot-reload caching issue for Mongoose models
if (mongoose.models.Tag) {
  delete mongoose.models.Tag;
}
export const Tag = mongoose.model("Tag", TagSchema);
