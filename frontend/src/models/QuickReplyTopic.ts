import mongoose, { Schema } from "mongoose";

const QuickReplyTopicSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    color: { type: String, default: "#1890ff" },
  },
  { timestamps: true, collection: "quick-reply-topics" }
);

export const QuickReplyTopic = mongoose.models.QuickReplyTopic || mongoose.model("QuickReplyTopic", QuickReplyTopicSchema);
