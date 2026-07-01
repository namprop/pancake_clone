const { connectDB } = require("../config/db");
const ImageFolder = require("../models/ImageFolder");
const QuickReply = require("../models/QuickReply");
const QuickReplyTopic = require("../models/QuickReplyTopic");

function sendError(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error.message || error });
}

async function listQuickReplies(req, res) {
  try {
    await connectDB();
    const items = await QuickReply.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createQuickReply(req, res) {
  try {
    await connectDB();
    const data = { ...(req.body || {}) };

    if (!data.id) {
      data.id = `qr-${Date.now()}`;
    }

    const item = new QuickReply(data);
    await item.save();
    return res.json({ success: true, data: item });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteQuickReply(req, res) {
  try {
    await connectDB();
    const { id } = req.query;

    if (!id) {
      return sendError(res, "Missing id", 400);
    }

    await QuickReply.findOneAndDelete({ id });
    return res.json({ success: true });
  } catch (error) {
    return sendError(res, error);
  }
}

async function listQuickReplyTopics(req, res) {
  try {
    await connectDB();
    const items = await QuickReplyTopic.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (error) {
    return sendError(res, error);
  }
}

async function upsertQuickReplyTopic(req, res) {
  try {
    await connectDB();
    const data = { ...(req.body || {}) };

    if (!data.id) {
      data.id = `topic-${Date.now()}`;
    }

    if (data._id) {
      const updated = await QuickReplyTopic.findOneAndUpdate(
        { id: data.id },
        data,
        { new: true }
      );
      return res.json({ success: true, data: updated });
    }

    const item = new QuickReplyTopic(data);
    await item.save();
    return res.json({ success: true, data: item });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteQuickReplyTopic(req, res) {
  try {
    await connectDB();
    const { id } = req.query;

    if (!id) {
      return sendError(res, "Missing id", 400);
    }

    await QuickReplyTopic.findOneAndDelete({ id });
    return res.json({ success: true });
  } catch (error) {
    return sendError(res, error);
  }
}

async function listImageFolders(req, res) {
  try {
    await connectDB();
    const folders = await ImageFolder.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: folders });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createImageFolder(req, res) {
  try {
    await connectDB();
    const data = { ...(req.body || {}) };

    if (!data.id) {
      data.id = `folder-${Date.now()}`;
    }

    const folder = new ImageFolder({
      id: data.id,
      name: data.name,
    });

    await folder.save();
    return res.json({ success: true, data: folder });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  listQuickReplies,
  createQuickReply,
  deleteQuickReply,
  listQuickReplyTopics,
  upsertQuickReplyTopic,
  deleteQuickReplyTopic,
  listImageFolders,
  createImageFolder,
};
