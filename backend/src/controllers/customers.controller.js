const { connectDB } = require("../config/db");
const Customer = require("../models/Customer");
const Page = require("../models/Page");

function sendError(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error.message || error });
}

async function listCustomers(req, res) {
  try {
    await connectDB();
    const activePages = await Page.find({ isActive: true }).select("pageId");
    const activePageIds = activePages.map((page) => page.pageId);
    const customers = await Customer.find({
      $or: [
        { platform: { $ne: "facebook" } },
        { pageId: { $in: activePageIds } },
      ],
    }).sort({ timestamp: -1 });

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
