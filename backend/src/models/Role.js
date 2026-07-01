const mongoose = require("mongoose");

const { Schema } = mongoose;

const RoleSchema = new Schema(
  {
    name: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    permissions: [{ type: String }],
    description: { type: String },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "roles-pancake" }
);

module.exports = mongoose.models.Role || mongoose.model("Role", RoleSchema);
