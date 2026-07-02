const { connectDB } = require("../config/db");
const Customer = require("../models/Customer");
const Page = require("../models/Page");

function sendError(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error.message || error });
}

function parseList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isTruthy(value) {
  return value === true || value === "true" || value === "1" || value === "yes";
}

function addDateRangeFilter(queryParts, from, to) {
  const range = {};
  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      fromDate.setHours(0, 0, 0, 0);
      range.$gte = fromDate;
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      range.$lte = toDate;
    }
  }

  if (Object.keys(range).length > 0) {
    queryParts.push({ timestamp: range });
  }
}

async function getDuplicateCustomerIds(baseQuery) {
  const groups = await Customer.aggregate([
    { $match: baseQuery },
    {
      $project: {
        id: 1,
        duplicateKey: {
          $cond: [
            { $and: [{ $ne: ["$phone", ""] }, { $ne: ["$phone", null] }] },
            { $concat: ["phone:", "$phone"] },
            {
              $cond: [
                {
                  $and: [
                    { $ne: ["$facebookCustomerId", ""] },
                    { $ne: ["$facebookCustomerId", null] },
                  ],
                },
                { $concat: ["fb:", "$facebookCustomerId"] },
                "",
              ],
            },
          ],
        },
      },
    },
    { $match: { duplicateKey: { $ne: "" } } },
    { $group: { _id: "$duplicateKey", ids: { $push: "$id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  return groups.flatMap((group) => group.ids);
}

async function listCustomers(req, res) {
  try {
    await connectDB();
    const activePages = await Page.find({ isActive: true }).select("pageId");
    const activePageIds = activePages.map((page) => page.pageId);

    const queryParts = [{
      $or: [
        { platform: { $ne: "facebook" } },
        { pageId: { $in: activePageIds } },
      ],
    }];

    if (req.query.readStatus === "unread") {
      queryParts.push({ unreadCount: { $gt: 0 } });
    } else if (req.query.readStatus === "read") {
      queryParts.push({
        $or: [
          { unreadCount: { $lte: 0 } },
          { unreadCount: { $exists: false } },
        ],
      });
    }

    if (req.query.sourceType === "inbox" || req.query.sourceType === "comment") {
      queryParts.push({ sourceType: req.query.sourceType });
    }

    const channels = parseList(req.query.channels || req.query.channel).filter((channel) =>
      ["inbox", "comment"].includes(channel)
    );
    if (channels.length === 1 && channels[0] === "inbox") {
      queryParts.push({
        $or: [
          { sourceType: "inbox" },
          { sourceType: "" },
          { sourceType: { $exists: false } },
        ],
      });
    } else if (channels.length === 1 && channels[0] === "comment") {
      queryParts.push({ sourceType: "comment" });
    }

    if (req.query.commentFilter && req.query.commentFilter !== "all") {
      queryParts.push({ sourceType: "comment" });

      if (req.query.commentFilter === "not_messaged") {
        queryParts.push({
          $or: [
            { hasPrivateReply: false },
            { hasPrivateReply: { $exists: false } },
          ],
        });
      } else if (req.query.commentFilter === "order_marked") {
        queryParts.push({ isOrderMarked: true });
      } else if (req.query.commentFilter === "livestream") {
        queryParts.push({ isFromLivestream: true });
      } else if (req.query.commentFilter === "not_livestream") {
        queryParts.push({
          $or: [
            { isFromLivestream: false },
            { isFromLivestream: { $exists: false } },
          ],
        });
      }
    }

    if (req.query.messageFilter && req.query.messageFilter !== "all") {
      queryParts.push({
        $or: [
          { sourceType: "inbox" },
          { sourceType: "" },
          { sourceType: { $exists: false } },
        ],
      });

      if (req.query.messageFilter === "handling") {
        queryParts.push({
          $or: [
            { assigneeName: { $exists: true, $nin: ["", null] } },
            { assignedAt: { $exists: true, $ne: null } },
          ],
        });
      } else if (req.query.messageFilter === "ai_disabled") {
        queryParts.push({ isAiDisabled: true });
      } else if (req.query.messageFilter === "ai_forwarded") {
        queryParts.push({ isAiForwarded: true });
      }
    }

    if (req.query.reviewStatus === "has_review") {
      queryParts.push({ hasReview: true });
    } else if (req.query.reviewStatus === "no_review") {
      queryParts.push({
        $or: [
          { hasReview: false },
          { hasReview: { $exists: false } },
        ],
      });
    }

    if (req.query.assigned === "assigned") {
      queryParts.push({
        $or: [
          { assigneeName: { $exists: true, $nin: ["", null] } },
          { assignedAt: { $exists: true, $ne: null } },
        ],
      });
    } else if (req.query.assigned === "unassigned") {
      queryParts.push({
        $and: [
          { $or: [{ assigneeName: "" }, { assigneeName: null }, { assigneeName: { $exists: false } }] },
          { $or: [{ assignedAt: null }, { assignedAt: { $exists: false } }] },
        ],
      });
    }

    if (isTruthy(req.query.starred)) {
      queryParts.push({ isStarred: true });
    }

    if (req.query.phone === "has") {
      queryParts.push({ phone: { $regex: "\\d{9,}" } });
    } else if (req.query.phone === "none") {
      queryParts.push({
        $or: [
          { phone: "" },
          { phone: null },
          { phone: { $exists: false } },
          { phone: { $not: /\d{9,}/ } },
        ],
      });
    }

    if (isTruthy(req.query.unreplied)) {
      queryParts.push({
        $or: [{ lastMessageSender: "customer" }, { unreadCount: { $gt: 0 } }],
      });
    }

    if (req.query.customerGroup === "new" || req.query.customerGroup === "old") {
      queryParts.push({ customerGroup: req.query.customerGroup });
    }

    addDateRangeFilter(queryParts, req.query.from, req.query.to);

    const baseQuery = { $and: queryParts };

    if (isTruthy(req.query.duplicate)) {
      const duplicateIds = await getDuplicateCustomerIds(baseQuery);
      queryParts.push({ id: { $in: duplicateIds } });
    }

    const customers = await Customer.find({ $and: queryParts }).sort({ timestamp: -1 });

    return res.json({ success: true, data: customers });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createCustomer(req, res) {
  try {
    await connectDB();
    const customer = new Customer(req.body);
    await customer.save();
    return res.json({ success: true, data: customer });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateCustomer(req, res) {
  try {
    await connectDB();
    const { customerId, fields } = req.body || {};

    if (!customerId || !fields || typeof fields !== "object") {
      return sendError(res, "Thiếu thông tin khách hàng cần cập nhật", 400);
    }

    const allowedFields = new Set([
      "name",
      "phone",
      "address",
      "provinceCode",
      "districtCode",
      "wardCode",
      "notes",
      "gender",
      "birthday",
      "assigneeName",
      "assignedAt",
      "sourceType",
      "lastMessageSender",
      "isStarred",
      "customerGroup",
      "hasPrivateReply",
      "isOrderMarked",
      "isFromLivestream",
      "isAiDisabled",
      "isAiForwarded",
      "hasReview",
      "reviewRating",
      "reviewText",
      "isResolved",
      "resolvedAt",
      "unreadCount",
    ]);
    const update = {};

    Object.entries(fields).forEach(([key, value]) => {
      if (allowedFields.has(key)) {
        update[key] = value;
      }
    });

    if (Object.keys(update).length === 0) {
      return sendError(res, "Không có trường hợp lệ để cập nhật", 400);
    }

    const customer = await Customer.findOneAndUpdate(
      { id: customerId },
      { $set: update },
      { new: true }
    );

    if (!customer) {
      return sendError(res, "Không tìm thấy khách hàng", 404);
    }

    return res.json({ success: true, data: customer });
  } catch (error) {
    return sendError(res, error);
  }
}

function listCustomerTags(req, res) {
  return res.json({ success: true, data: [] });
}

async function updateCustomerTags(req, res) {
  try {
    await connectDB();
    const { customerId, tags, syncByCustomer } = req.body || {};

    if (!customerId || !Array.isArray(tags)) {
      return sendError(res, "Invalid data format", 400);
    }

    const targetCustomer = await Customer.findOne({ id: customerId });
    if (!targetCustomer) {
      return sendError(res, "Customer not found", 404);
    }

    const targetPhone = targetCustomer.phone;

    if (syncByCustomer && targetPhone) {
      await Customer.updateMany({ phone: targetPhone }, { $set: { tags } });
    } else {
      await Customer.findOneAndUpdate({ id: customerId }, { $set: { tags } });
    }

    return res.json({ success: true });
  } catch (error) {
    return sendError(res, error);
  }
}

async function toggleMessagePin(req, res) {
  try {
    await connectDB();
    const { customerId, msgId } = req.params;

    const customer = await Customer.findOne({ id: customerId });
    if (!customer) {
      return sendError(res, "Customer not found", 404);
    }

    const messageIndex = customer.chatHistory.findIndex(
      (message) => message.id === msgId
    );
    if (messageIndex === -1) {
      return sendError(res, "Message not found", 404);
    }

    customer.chatHistory[messageIndex].isPinned =
      !customer.chatHistory[messageIndex].isPinned;
    await customer.save();

    return res.json({ success: true, data: customer });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  listCustomers,
  createCustomer,
  updateCustomer,
  listCustomerTags,
  updateCustomerTags,
  toggleMessagePin,
};
