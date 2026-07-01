const { connectDB } = require("../config/db");
const ActivityLog = require("../models/ActivityLog");
const AutoReply = require("../models/AutoReply");
const Role = require("../models/Role");
const RotationRule = require("../models/RotationRule");
const Tag = require("../models/Tag");
const Workspace = require("../models/Workspace");
const WorkspaceSetting = require("../models/WorkspaceSetting");

function sendError(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error.message || error });
}

function workspaceFilter(req) {
  return req.query.workspaceId ? { workspaceId: req.query.workspaceId } : {};
}

async function listTags(req, res) {
  try {
    await connectDB();
    const tags = await Tag.find(workspaceFilter(req));
    return res.json({ success: true, data: tags });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createTag(req, res) {
  try {
    await connectDB();
    const newTag = await Tag.create(req.body);
    return res.status(201).json({ success: true, data: newTag });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateTag(req, res) {
  try {
    await connectDB();
    const updated = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return sendError(res, "Tag not found", 404);
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteTag(req, res) {
  try {
    await connectDB();
    const deleted = await Tag.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendError(res, "Tag not found", 404);
    }
    return res.json({ success: true, data: deleted });
  } catch (error) {
    return sendError(res, error);
  }
}

async function listRoles(req, res) {
  try {
    await connectDB();
    const roles = await Role.find(workspaceFilter(req));
    return res.json({ success: true, data: roles });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createRole(req, res) {
  try {
    await connectDB();
    const newRole = await Role.create(req.body);
    return res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    return sendError(res, error);
  }
}

async function listWorkspaces(req, res) {
  try {
    await connectDB();
    const workspaces = await Workspace.find();
    return res.json({ success: true, data: workspaces });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createWorkspace(req, res) {
  try {
    await connectDB();
    const newWorkspace = await Workspace.create(req.body);
    return res.status(201).json({ success: true, data: newWorkspace });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateWorkspace(req, res) {
  try {
    await connectDB();
    const { id, ...updateData } = req.body || {};

    if (!id) {
      return sendError(res, "Missing ID", 400);
    }

    const updated = await Workspace.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getWorkspaceSettings(req, res) {
  try {
    await connectDB();
    const { workspaceId } = req.query;

    if (!workspaceId) {
      return sendError(res, "Missing workspaceId", 400);
    }

    let settings = await WorkspaceSetting.findOne({ workspaceId });
    if (!settings) {
      settings = await WorkspaceSetting.create({ workspaceId });
    }

    return res.json({ success: true, data: settings });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateWorkspaceSettings(req, res) {
  try {
    await connectDB();
    const {
      workspaceId,
      tagSettings,
      interfaceSettings,
      generalSettings,
      quickReplySettings,
    } = req.body || {};

    if (!workspaceId) {
      return sendError(res, "Missing workspaceId", 400);
    }

    const updateData = {};
    if (tagSettings !== undefined) updateData.tagSettings = tagSettings;
    if (interfaceSettings !== undefined) {
      updateData.interfaceSettings = interfaceSettings;
    }
    if (generalSettings !== undefined) {
      updateData.generalSettings = generalSettings;
    }
    if (quickReplySettings !== undefined) {
      updateData.quickReplySettings = quickReplySettings;
    }

    const settings = await WorkspaceSetting.findOneAndUpdate(
      { workspaceId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return res.json({ success: true, data: settings });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateGeneralSettings(req, res) {
  try {
    await connectDB();
    const updated = await WorkspaceSetting.findOneAndUpdate(
      { workspaceId: "default-workspace" },
      { $set: { generalSettings: req.body } },
      { new: true, upsert: true }
    );

    return res.json({ success: true, data: updated });
  } catch (error) {
    return sendError(res, error);
  }
}

async function listAutoReplies(req, res) {
  try {
    await connectDB();
    const autoReplies = await AutoReply.find(workspaceFilter(req));
    return res.json({ success: true, data: autoReplies });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createAutoReply(req, res) {
  try {
    await connectDB();
    const newRule = await AutoReply.create(req.body);
    return res.status(201).json({ success: true, data: newRule });
  } catch (error) {
    return sendError(res, error);
  }
}

async function listActivityLogs(req, res) {
  try {
    await connectDB();
    const logs = await ActivityLog.find(workspaceFilter(req))
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("userId", "fullName email");
    return res.json({ success: true, data: logs });
  } catch (error) {
    return sendError(res, error);
  }
}

async function listRotationRules(req, res) {
  try {
    await connectDB();
    const rules = await RotationRule.find(workspaceFilter(req)).populate(
      "assignedUsers.userId",
      "fullName email avatar"
    );
    return res.json({ success: true, data: rules });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createRotationRule(req, res) {
  try {
    await connectDB();
    const newRule = await RotationRule.create(req.body);
    return res.status(201).json({ success: true, data: newRule });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  listRoles,
  createRole,
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  getWorkspaceSettings,
  updateWorkspaceSettings,
  updateGeneralSettings,
  listAutoReplies,
  createAutoReply,
  listActivityLogs,
  listRotationRules,
  createRotationRule,
};
