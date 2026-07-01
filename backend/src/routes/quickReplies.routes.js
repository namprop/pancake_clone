const { Router } = require("express");

const quickRepliesController = require("../controllers/quickReplies.controller");

const quickRepliesRouter = Router();
quickRepliesRouter.get("/", quickRepliesController.listQuickReplies);
quickRepliesRouter.post("/", quickRepliesController.createQuickReply);
quickRepliesRouter.delete("/", quickRepliesController.deleteQuickReply);

const quickReplyTopicsRouter = Router();
quickReplyTopicsRouter.get("/", quickRepliesController.listQuickReplyTopics);
quickReplyTopicsRouter.post("/", quickRepliesController.upsertQuickReplyTopic);
quickReplyTopicsRouter.delete("/", quickRepliesController.deleteQuickReplyTopic);

const imageFoldersRouter = Router();
imageFoldersRouter.get("/", quickRepliesController.listImageFolders);
imageFoldersRouter.post("/", quickRepliesController.createImageFolder);

module.exports = {
  quickRepliesRouter,
  quickReplyTopicsRouter,
  imageFoldersRouter,
};
