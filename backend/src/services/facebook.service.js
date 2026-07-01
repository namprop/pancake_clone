const bcrypt = require("bcryptjs");

const Page = require("../models/Page");
const User = require("../models/User");
const { getAuthPayload } = require("./auth.service");

async function subscribePageToFacebookWebhooks(pageId, pageAccessToken) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/subscribed_apps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed_fields: "messages,messaging_postbacks,messaging_optins",
        access_token: pageAccessToken,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to subscribe page to webhooks");
  }

  return {
    success: true,
    pageId,
    data,
  };
}

async function getOrCreateCurrentUser(req) {
  const auth = getAuthPayload(req);
  let userDoc = auth ? await User.findById(auth.userId) : null;

  if (!userDoc || !userDoc.isActive) {
    userDoc = await User.findOne({ isActive: true });
  }

  if (!userDoc) {
    userDoc = await User.findOne();
  }

  if (!userDoc) {
    try {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      userDoc = await User.create({
        _id: "65a123456789012345678901",
        fullName: "Khách ẩn danh",
        email: "guest@pancake.vn",
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });
      console.log("Auto-created default admin user in DB:", userDoc._id);
    } catch (error) {
      console.error("Failed to auto-create default admin user:", error);
    }
  }

  return userDoc;
}

function getFirstString(...values) {
  return values.find(
    (value) => typeof value === "string" && value.trim().length > 0
  );
}

function parseFacebookAttachment(attachment) {
  const fileName = attachment?.name;
  const fileType = attachment?.mime_type;
  const fileSize = attachment?.size;
  const mediaUrl = getFirstString(
    attachment?.file_url,
    attachment?.image_data?.url,
    attachment?.image_data?.preview_url,
    attachment?.image_data?.animated_image_url,
    attachment?.video_data?.url,
    attachment?.video_data?.preview_url,
    attachment?.payload?.url,
    attachment?.url,
    attachment?.preview_url,
    attachment?.animated_image_url,
    attachment?.image_url
  );

  const looksLikeImage =
    fileType?.startsWith("image/") ||
    !!attachment?.image_data ||
    fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const looksLikeAudio =
    fileType?.startsWith("audio/") ||
    fileName?.startsWith("audioclip-") ||
    fileName?.match(/\.(mp3|wav|m4a|aac|ogg)$/i);
  const looksLikeVideo =
    fileType?.startsWith("video/") ||
    !!attachment?.video_data ||
    fileName?.match(/\.(mp4|mov|webm)$/i);

  if (looksLikeImage) {
    return {
      messageType: fileName?.toLowerCase().includes("sticker")
        ? "sticker"
        : "image",
      image: mediaUrl,
      fileName,
      fileType,
      fileSize,
    };
  }

  if (looksLikeAudio) {
    return {
      messageType: "audio",
      fileUrl: mediaUrl,
      fileName,
      fileType,
      fileSize,
    };
  }

  if (looksLikeVideo) {
    return {
      messageType: "video",
      fileUrl: mediaUrl,
      image: getFirstString(attachment?.video_data?.preview_url),
      fileName,
      fileType,
      fileSize,
    };
  }

  return {
    messageType: "file",
    fileUrl: mediaUrl,
    fileName,
    fileType,
    fileSize,
  };
}

function getOutgoingAttachmentType(file) {
  const type = file.mimetype || "";
  const name = file.originalname || "";

  if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)) {
    return "image";
  }
  if (type.startsWith("video/") || /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(name)) {
    return "video";
  }
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(name)) {
    return "audio";
  }
  return "file";
}

function getOutgoingAttachmentSummary(type) {
  if (type === "image") return "[Hình ảnh]";
  if (type === "video") return "[Video]";
  if (type === "audio") return "[Âm thanh]";
  return "[File đính kèm]";
}

async function getActivePages(pageId) {
  return pageId ? Page.find({ pageId }) : Page.find({ isActive: true });
}

module.exports = {
  subscribePageToFacebookWebhooks,
  getOrCreateCurrentUser,
  parseFacebookAttachment,
  getOutgoingAttachmentType,
  getOutgoingAttachmentSummary,
  getActivePages,
};
