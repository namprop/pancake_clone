const fs = require("fs/promises");
const path = require("path");

const { connectDB } = require("../config/db");
const Customer = require("../models/Customer");
const Page = require("../models/Page");
const { encryptToken, decryptToken } = require("../services/crypto.service");
const {
  getActivePages,
  getOrCreateCurrentUser,
  getOutgoingAttachmentSummary,
  getOutgoingAttachmentType,
  parseFacebookAttachment,
  subscribePageToFacebookWebhooks,
} = require("../services/facebook.service");

function sendError(res, error, status = 500) {
  return res.status(status).json({ success: false, error: error.message || error });
}

function frontendUrl(pathname) {
  const origin = process.env.FRONTEND_ORIGIN || "http://localhost:3012";
  return new URL(pathname, origin).toString();
}

function renderHelperPage(appId, redirectUri, error) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cấu hình Kết nối Facebook</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f0f9ff; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { max-width: 560px; background: #fff; border: 1px solid #e0f2fe; border-radius: 18px; padding: 32px; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12); }
    h1 { margin: 0 0 12px; font-size: 24px; }
    p, li { color: #64748b; line-height: 1.6; }
    .error { background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; border-radius: 12px; padding: 14px; margin: 18px 0; }
    .code { font-family: monospace; color: #0f172a; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    .btn { display: block; text-align: center; text-decoration: none; border-radius: 12px; padding: 14px 18px; margin-top: 12px; font-weight: 700; }
    .primary { background: #1877f2; color: white; }
    .secondary { background: #f1f5f9; color: #475569; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Kết nối Fanpage của bạn</h1>
    <p>Bạn đã xác thực Facebook thành công. Để lưu cấu hình Fanpage thật, vui lòng thiết lập App Secret.</p>
    ${error ? `<div class="error"><strong>Chi tiết lỗi:</strong><br>${error}</div>` : ""}
    <ol>
      <li>Thêm <span class="code">FACEBOOK_APP_SECRET</span> vào file môi trường backend.</li>
      <li>Đảm bảo redirect URI là <span class="code">${redirectUri}</span>.</li>
      <li>Khởi động lại backend.</li>
    </ol>
    <a href="/api/facebook/callback?mock=true" class="btn primary">Tiếp tục bằng Fanpage giả lập</a>
    <a href="/facebook-connect" class="btn secondary">Quay lại trang kết nối</a>
  </div>
</body>
</html>`;
}

async function callback(req, res) {
  try {
    await connectDB();

    const code = req.query.code;
    const mock = req.query.mock === "true" || code === "mock";
    const userDoc = await getOrCreateCurrentUser(req);

    if (!userDoc) {
      return res
        .status(400)
        .json({ error: "Không tìm thấy người dùng hoạt động trong hệ thống." });
    }

    if (mock) {
      await Page.findOneAndUpdate(
        { pageId: "1708753803778608" },
        {
          userId: userDoc._id,
          pageName: "Bella Boutique (Thời Trang)",
          pageAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
          pageAccessToken: encryptToken("mock-access-token-bella-boutique"),
          tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        { upsert: true, new: true }
      );

      return res.redirect(frontendUrl("/facebook-connect?success=true"));
    }

    if (!code) {
      return res
        .status(400)
        .json({ error: "Không tìm thấy mã code xác thực từ Facebook." });
    }

    const appId = process.env.FACEBOOK_APP_ID || "1708753803778608";
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri =
      process.env.FACEBOOK_REDIRECT_URI ||
      `${process.env.FRONTEND_ORIGIN || "http://localhost:3012"}/api/facebook/callback`;

    if (!appSecret) {
      return res
        .status(200)
        .type("html")
        .send(renderHelperPage(appId, redirectUri));
    }

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res
        .status(200)
        .type("html")
        .send(renderHelperPage(appId, redirectUri, tokenData.error.message));
    }

    const userAccessToken = tokenData.access_token;
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${userAccessToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    const finalUserToken = longLivedData.access_token || userAccessToken;
    const expiresSec = longLivedData.expires_in || 5184000;
    const tokenExpiresAt = new Date(Date.now() + expiresSec * 1000);

    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${finalUserToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      return res
        .status(200)
        .type("html")
        .send(renderHelperPage(appId, redirectUri, pagesData.error.message));
    }

    const facebookPages = pagesData.data || [];
    if (facebookPages.length === 0) {
      return res
        .status(200)
        .type("html")
        .send(
          renderHelperPage(
            appId,
            redirectUri,
            "Tài khoản Facebook của bạn chưa sở hữu hoặc quản lý Fanpage nào."
          )
        );
    }

    for (const fbPage of facebookPages) {
      const pageId = fbPage.id;
      await Page.findOneAndUpdate(
        { pageId },
        {
          userId: userDoc._id,
          pageName: fbPage.name,
          pageAvatar: `https://graph.facebook.com/v19.0/${pageId}/picture?type=square`,
          pageAccessToken: encryptToken(fbPage.access_token),
          tokenExpiresAt,
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }

    return res.redirect(frontendUrl("/facebook-connect?success=true"));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return res.status(500).json({ error: `Lỗi hệ thống: ${error.message}` });
  }
}

async function listPages(req, res) {
  try {
    await connectDB();
    const userDoc = await getOrCreateCurrentUser(req);
    if (!userDoc) {
      return res.json({ success: false, data: [] });
    }

    const pages = await Page.find({ userId: userDoc._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: pages });
  } catch (error) {
    console.error("GET /api/facebook/pages error:", error);
    return sendError(res, error);
  }
}

async function connectPage(req, res) {
  try {
    await connectDB();
    const { pageId, isActive } = req.body || {};

    if (!pageId) {
      return sendError(res, "pageId là bắt buộc.", 400);
    }

    const updatedPage = await Page.findOneAndUpdate(
      { pageId },
      { isActive: !!isActive },
      { new: true }
    );

    if (!updatedPage) {
      return sendError(res, "Không tìm thấy Page.", 404);
    }

    return res.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error("POST /api/facebook/pages/connect error:", error);
    return sendError(res, error);
  }
}

async function subscribeWebhooks(req, res) {
  try {
    await connectDB();
    const pages = await Page.find({ isActive: true }).sort({ createdAt: -1 });
    const results = [];

    for (const page of pages) {
      try {
        const pageAccessToken = decryptToken(page.pageAccessToken);
        const result = await subscribePageToFacebookWebhooks(
          page.pageId,
          pageAccessToken
        );
        results.push({ ...result, pageName: page.pageName });
      } catch (error) {
        results.push({
          pageId: page.pageId,
          pageName: page.pageName,
          success: false,
          error: error.message,
        });
      }
    }

    console.log("Facebook webhook subscription results:", results);
    return res.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error("POST /api/facebook/webhook-subscriptions error:", error);
    return sendError(res, error);
  }
}

async function syncFacebook(req, res) {
  try {
    await connectDB();
    const { pageId } = req.body || {};
    const pages = await getActivePages(pageId);

    if (pages.length === 0) {
      return sendError(res, "Không tìm thấy Page hoạt động để đồng bộ.", 404);
    }

    let syncCount = 0;
    const pageResults = [];

    for (const page of pages) {
      const pageAccessToken = decryptToken(page.pageAccessToken);
      const conversationsUrl = `https://graph.facebook.com/v19.0/${page.pageId}/conversations?fields=id,snippet,updated_time,participants,unread_count&access_token=${pageAccessToken}`;
      const conversationsRes = await fetch(conversationsUrl);
      const conversationsData = await conversationsRes.json();

      if (conversationsData.error) {
        if (pageId) {
          return sendError(res, conversationsData.error.message, 400);
        }

        pageResults.push({
          pageId: page.pageId,
          pageName: page.pageName,
          syncCount: 0,
          error: conversationsData.error.message,
        });
        continue;
      }

      const conversations = conversationsData.data || [];
      let pageSyncCount = 0;

      for (const conv of conversations) {
        const conversationId = conv.id;
        const snippet = conv.snippet || "";
        const unreadCount = conv.unread_count || 0;
        const updatedTime = new Date(conv.updated_time);
        const participants = conv.participants?.data || [];
        const customerInfo =
          participants.find((participant) => participant.id !== page.pageId) ||
          participants[0];

        if (!customerInfo) continue;

        const customerId = customerInfo.id;
        const conversationKey = `${page.pageId}:${customerId}`;
        const messagesUrl = `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,message,created_time,from,to,attachments{id,mime_type,name,size,file_url,image_data,video_data}&limit=20&access_token=${pageAccessToken}`;
        const messagesRes = await fetch(messagesUrl);
        const messagesData = await messagesRes.json();
        const fbMessages = messagesData.data || [];

        fbMessages.sort(
          (a, b) => new Date(a.created_time).getTime() - new Date(b.created_time).getTime()
        );

        const chatHistory = fbMessages
          .flatMap((msg) => {
            const isFromPage = msg.from?.id === page.pageId;
            const attachments = msg.attachments?.data || [];
            const text = msg.message || "";

            if (attachments.length === 0) {
              return [
                {
                  id: msg.id,
                  sender: isFromPage ? "shop" : "customer",
                  messageType: "text",
                  text,
                  timestamp: new Date(msg.created_time),
                },
              ];
            }

            return attachments.map((attachment, attachmentIndex) => {
              const parsedAttachment = parseFacebookAttachment(attachment);
              const hasRenderableAttachment =
                !!parsedAttachment.image || !!parsedAttachment.fileUrl;
              const attachmentText =
                attachmentIndex === 0
                  ? text ||
                    (hasRenderableAttachment
                      ? ""
                      : "Đính kèm không hỗ trợ xem trước")
                  : "";

              return {
                id: attachment.id
                  ? `${msg.id}-${attachment.id}`
                  : `${msg.id}-${attachmentIndex}`,
                sender: isFromPage ? "shop" : "customer",
                text: attachmentText,
                timestamp: new Date(msg.created_time),
                ...parsedAttachment,
              };
            });
          })
          .filter((msg) => msg.text || msg.image || msg.fileUrl);

        const normalizedChatHistory = chatHistory.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          messageType: msg.messageType,
          text: msg.text || "",
          timestamp: msg.timestamp,
          image: msg.image,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileType: msg.fileType,
          fileSize: msg.fileSize,
        }));

        await Customer.findOneAndUpdate(
          { id: conversationKey },
          {
            id: conversationKey,
            facebookCustomerId: customerId,
            pageId: page.pageId,
            pageName: page.pageName,
            facebookConversationId: conversationId,
            name: customerInfo.name,
            platform: "facebook",
            avatar: `https://graph.facebook.com/v19.0/${customerId}/picture?type=square`,
            lastMessage: snippet,
            timestamp: updatedTime,
            unreadCount,
            chatHistory: normalizedChatHistory,
          },
          { upsert: true, new: true }
        );

        pageSyncCount++;
        syncCount++;
      }

      pageResults.push({
        pageId: page.pageId,
        pageName: page.pageName,
        syncCount: pageSyncCount,
      });
    }

    return res.json({
      success: true,
      data: { syncCount, pageCount: pages.length, pageResults },
    });
  } catch (error) {
    console.error("POST /api/facebook/sync error:", error);
    return sendError(res, error);
  }
}

async function sendMessage(req, res) {
  try {
    await connectDB();

    const { conversationId, pageId, customerId, text, replyTo } = req.body || {};
    const files = req.files || [];
    const urls = Object.entries(req.body || {})
      .filter(([key, value]) => key.startsWith("url_") && typeof value === "string")
      .map(([, value]) => value);

    let replyToObj;
    if (replyTo) {
      try {
        replyToObj = JSON.parse(replyTo);
      } catch {}
    }

    if (!customerId || (!text && files.length === 0 && urls.length === 0)) {
      return sendError(res, "customerId và (text hoặc hình ảnh) là bắt buộc.", 400);
    }

    const customerRecord = await Customer.findOne({
      id: conversationId || customerId,
    });

    const targetPageId = customerRecord?.pageId || pageId;
    const targetCustomerId =
      customerRecord?.facebookCustomerId ||
      (typeof customerId === "string" && customerId.includes(":")
        ? customerId.slice(customerId.indexOf(":") + 1)
        : customerId);
    const targetConversationId = customerRecord?.pageId
      ? customerRecord.id
      : targetPageId
        ? `${targetPageId}:${targetCustomerId}`
        : customerId;

    const page = await Page.findOne(
      targetPageId ? { pageId: targetPageId } : { isActive: true }
    );

    if (!page) {
      return sendError(res, "Không tìm thấy Page hoạt động để gửi tin.", 404);
    }

    const pageAccessToken = decryptToken(page.pageAccessToken);
    const newMsgs = [];
    let lastMessageText = "";

    if (text) {
      const payload = {
        recipient: { id: targetCustomerId },
        message: { text },
      };
      if (replyToObj?.messageId) {
        payload.reply_to = { mid: replyToObj.messageId };
      }

      const sendRes = await fetch(
        `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const sendData = await sendRes.json();

      if (sendData.error) {
        return sendError(res, sendData.error.message, 400);
      }

      newMsgs.push({
        id: sendData.message_id || `msg-${Date.now()}-shop`,
        sender: "shop",
        text,
        timestamp: new Date(),
        replyTo: replyToObj,
      });
      lastMessageText = text;
    }

    const uploadsDir = path.join(__dirname, "..", "..", "public", "uploads");
    if (files.length > 0) {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
      const filepath = path.join(uploadsDir, filename);
      await fs.writeFile(filepath, file.buffer);

      const localUrl = `/uploads/${filename}`;
      const attachmentType = getOutgoingAttachmentType(file);
      const fbFormData = new FormData();
      fbFormData.append("recipient", JSON.stringify({ id: targetCustomerId }));
      fbFormData.append(
        "message",
        JSON.stringify({
          attachment: {
            type: attachmentType,
            payload: { is_reusable: false },
          },
        })
      );
      if (replyToObj?.messageId) {
        fbFormData.append("reply_to", JSON.stringify({ mid: replyToObj.messageId }));
      }
      fbFormData.append(
        "filedata",
        new Blob([file.buffer], { type: file.mimetype }),
        file.originalname
      );

      const fileRes = await fetch(
        `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
        { method: "POST", body: fbFormData }
      );
      const fileData = await fileRes.json();

      if (!fileData.error) {
        newMsgs.push({
          id: fileData.message_id || `msg-${Date.now()}-shop-${attachmentType}`,
          sender: "shop",
          messageType: attachmentType,
          text: "",
          image: attachmentType === "image" ? localUrl : undefined,
          fileUrl: attachmentType === "image" ? undefined : localUrl,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          timestamp: new Date(),
        });
        if (!lastMessageText) {
          lastMessageText = getOutgoingAttachmentSummary(attachmentType);
        }
      } else {
        console.error("Facebook Send Attachment Error:", fileData.error);
      }
    }

    for (const url of urls) {
      const payload = {
        recipient: { id: targetCustomerId },
        message: {
          attachment: { type: "image", payload: { url, is_reusable: true } },
        },
      };
      if (replyToObj?.messageId) {
        payload.reply_to = { mid: replyToObj.messageId };
      }

      const sendRes = await fetch(
        `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const sendData = await sendRes.json();

      if (!sendData.error) {
        newMsgs.push({
          id: sendData.message_id || `msg-${Date.now()}-shop-img-url`,
          sender: "shop",
          messageType: "image",
          text: "",
          image: url,
          timestamp: new Date(),
        });
        if (!lastMessageText) lastMessageText = "[Hình ảnh]";
      } else {
        console.error("Facebook Send Image URL Error:", sendData.error);
      }
    }

    if (newMsgs.length === 0 && !text) {
      return sendError(res, "Gửi thất bại", 400);
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { id: targetConversationId },
      {
        $push: { chatHistory: { $each: newMsgs } },
        $set: {
          facebookCustomerId: targetCustomerId,
          pageId: page.pageId,
          pageName: page.pageName,
          lastMessage: lastMessageText,
          timestamp: new Date(),
          unreadCount: 0,
        },
        $setOnInsert: {
          id: targetConversationId,
          name: customerRecord?.name || targetCustomerId,
          avatar:
            customerRecord?.avatar ||
            `https://graph.facebook.com/v19.0/${targetCustomerId}/picture?type=square`,
          platform: "facebook",
          tags: customerRecord?.tags || [],
          phone: customerRecord?.phone || "",
          address: customerRecord?.address || "",
          provinceCode: customerRecord?.provinceCode || "",
          districtCode: customerRecord?.districtCode || "",
          wardCode: customerRecord?.wardCode || "",
          notes: customerRecord?.notes || "",
        },
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, data: updatedCustomer });
  } catch (error) {
    console.error("POST /api/facebook/send-message error:", error);
    return sendError(res, error);
  }
}

module.exports = {
  callback,
  listPages,
  connectPage,
  subscribeWebhooks,
  syncFacebook,
  sendMessage,
};
