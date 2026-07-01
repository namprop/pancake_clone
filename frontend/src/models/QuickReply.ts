import mongoose, { Schema } from "mongoose";

const QuickReplySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    shortcut: { type: String, required: true }, // e.g., "/sdt"
    text: { type: String, required: true }, // e.g., "Số điện thoại bên em là..."
    description: { type: String, default: "" },
    topicId: { type: String, default: "" },
  },
  { timestamps: true, collection: "quick-replies" }
);

export const QuickReply = mongoose.models.QuickReply || mongoose.model("QuickReply", QuickReplySchema);
