import mongoose, { Schema, type Model } from "mongoose";

const RoleSchema = new Schema(
  {
    name: { type: String, required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    permissions: [{ type: String }], // Array of permission strings e.g., ["view_orders", "edit_settings"]
    description: { type: String },
    isSystem: { type: Boolean, default: false }, // System roles like 'Admin' cannot be deleted
  },
  { timestamps: true, collection: 'roles-pancake' }
);

export const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);
