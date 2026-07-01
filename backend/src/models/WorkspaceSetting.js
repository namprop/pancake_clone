const mongoose = require("mongoose");

const { Schema } = mongoose;

const WorkspaceSettingSchema = new Schema(
  {
    workspaceId: { type: String, required: true, unique: true },
    tagSettings: {
      allowMultiple: { type: Boolean, default: true },
      showFullName: { type: Boolean, default: true },
      filterMode: { type: String, enum: ["AND", "OR"], default: "AND" },
      syncByCustomer: { type: Boolean, default: false },
      callCenter: {
        successTagId: { type: String, default: "" },
        failTagId: { type: String, default: "" },
      },
    },
    interfaceSettings: {
      showMainAssignee: { type: Boolean, default: false },
      showViewingAccount: { type: Boolean, default: false },
      showPageInfo: { type: Boolean, default: true },
    },
    quickReplySettings: {
      suggestQuickReply: { type: Boolean, default: true },
      sendImmediately: { type: Boolean, default: false },
      enableTopics: { type: Boolean, default: false },
      staffDetails: { type: String, default: "" },
    },
    generalSettings: {
      browserNotify: { type: Boolean, default: true },
      playSound: { type: String, default: "Mặc định" },
      pushUnread: { type: Boolean, default: true },
      quickSwitch: { type: String, default: "Tắt" },
      useTasks: { type: String, default: "Tắt" },
      groupImages: { type: String, default: "Gửi nhóm ảnh" },
      autoHideComment: { type: String, default: "Tắt" },
      autoHideCommentPast: { type: String, default: "Tắt" },
      autoHideSpam: { type: Boolean, default: false },
      autoIgnoreTag: { type: Boolean, default: false },
      autoIgnoreSticker: { type: Boolean, default: false },
      autoSaveBirthday: { type: Boolean, default: false },
      autoLikeComment: { type: Boolean, default: false },
      sendLeadEvent: { type: Boolean, default: true },
      sendPurchaseEvent: { type: Boolean, default: true },
      ignoreSpamFolder: { type: Boolean, default: false },
      autoCreatePosOrder: { type: Boolean, default: true },
      botcakeNotify: { type: Boolean, default: true },
      botcakeSync: { type: Boolean, default: false },
    },
  },
  { timestamps: true, collection: "workspace-settings-pancake" }
);

module.exports =
  mongoose.models.WorkspaceSetting ||
  mongoose.model("WorkspaceSetting", WorkspaceSettingSchema);
