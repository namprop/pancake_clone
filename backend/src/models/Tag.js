const mongoose = require("mongoose");

const { Schema } = mongoose;

const TagSchema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, default: "#3b82f6" },
    order: { type: Number, default: 0 },
    description: { type: String },
    isInactive: { type: Boolean, default: false },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true, collection: "tags-pancake" }
);

module.exports = mongoose.models.Tag || mongoose.model("Tag", TagSchema);
