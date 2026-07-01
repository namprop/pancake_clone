const mongoose = require("mongoose");

const { Schema } = mongoose;

const AutoReplySchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["KEYWORD", "OUT_OF_HOURS", "FIRST_TIME"],
      required: true,
    },
    keywords: [{ type: String }],
    content: { type: String, required: true },
    attachments: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "autoreplies-pancake" }
);

module.exports =
  mongoose.models.AutoReply || mongoose.model("AutoReply", AutoReplySchema);
