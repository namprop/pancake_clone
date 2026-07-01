import mongoose, { Schema, type Model } from "mongoose";

const WorkspaceSchema = new Schema(
  {
    name: { type: String, required: true },
    timezone: { type: String, default: "Asia/Ho_Chi_Minh" },
    greeting: { type: String },
    interface: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
      language: { type: String, default: "vi" },
    },
    sync: {
      facebookToken: { type: String },
      syncInterval: { type: Number, default: 5 }, // in minutes
      lastSyncAt: { type: Date },
    },
    tools: {
      shippingProviders: [{ type: String }],
      webhooks: [{ url: String, secret: String, events: [String] }],
    },
    calls: {
      voipProvider: { type: String },
      credentials: { type: Schema.Types.Mixed },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'workspaces-pancake' }
);

export const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);
