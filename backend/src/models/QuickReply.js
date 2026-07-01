const mongoose = require("mongoose");

const { Schema } = mongoose;

const QuickReplySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    shortcut: { type: String, required: true },
    text: { type: String, required: true },
    description: { type: String, default: "" },
    topicId: { type: String, default: "" },
  },
  { timestamps: true, collection: "quick-replies" }
);

module.exports =
  mongoose.models.QuickReply || mongoose.model("QuickReply", QuickReplySchema);
