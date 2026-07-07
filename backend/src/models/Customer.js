const mongoose = require("mongoose");

const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ["customer", "shop", "system"], required: true },
    messageType: {
      type: String,
      enum: ["text", "image", "sticker", "audio", "file", "video"],
      default: "text",
    },
    text: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    image: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    fileSize: { type: Number },
    isQuickReplyUsed: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    replyTo: {
      messageId: { type: String },
      senderName: { type: String },
      text: { type: String },
    },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    facebookCustomerId: { type: String, default: "" },
    pageId: { type: String, default: "" },
    pageName: { type: String, default: "" },
    facebookConversationId: { type: String, default: "" },
    sourceType: { type: String, enum: ["inbox", "comment"], default: "inbox" },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    platform: { type: String, required: true },
    tags: { type: [String], default: [] },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    provinceCode: { type: String, default: "" },
    districtCode: { type: String, default: "" },
    wardCode: { type: String, default: "" },
    lastMessage: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    unreadCount: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: null },
    lastMessageSender: {
      type: String,
      enum: ["customer", "shop", "system"],
      default: "customer",
    },
    chatHistory: { type: [MessageSchema], default: [] },
    notes: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "unknown"], default: "male" },
    birthday: { type: String, default: "" },
    assigneeName: { type: String, default: "" },
    assignedAt: { type: Date, default: null },
    isStarred: { type: Boolean, default: false },
    customerGroup: { type: String, enum: ["new", "old"], default: "new" },
    hasPrivateReply: { type: Boolean, default: false },
    isOrderMarked: { type: Boolean, default: false },
    isFromLivestream: { type: Boolean, default: false },
    isAiDisabled: { type: Boolean, default: false },
    isAiForwarded: { type: Boolean, default: false },
    hasReview: { type: Boolean, default: false },
    reviewRating: { type: Number, default: 0 },
    reviewText: { type: String, default: "" },
    isResolved: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "customers" }
);

module.exports =
  mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
