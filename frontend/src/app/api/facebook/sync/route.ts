import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Page } from "@/models/Page";
import { Customer } from "@/models/Customer";
import { decryptToken } from "@/lib/crypto";

type ParsedAttachment = {
  messageType: "image" | "sticker" | "audio" | "file" | "video";
  image?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
};

function getFirstString(...values: any[]) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0);
}

function parseAttachment(attachment: any): ParsedAttachment {
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
      messageType: fileName?.toLowerCase().includes("sticker") ? "sticker" : "image",
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

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const { pageId } = body;
    const pages = pageId
      ? await Page.find({ pageId })
      : await Page.find({ isActive: true });

    if (pages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Page hoạt động để đồng bộ." },
        { status: 404 }
      );
    }

    let syncCount = 0;
    const pageResults: Array<{
      pageId: string;
      pageName: string;
      syncCount: number;
      error?: string;
    }> = [];

    for (const page of pages) {
      const pageAccessToken = decryptToken(page.pageAccessToken);
      const conversationsUrl = `https://graph.facebook.com/v19.0/${page.pageId}/conversations?fields=id,snippet,updated_time,participants,unread_count&access_token=${pageAccessToken}`;
      const conversationsRes = await fetch(conversationsUrl);
      const conversationsData = await conversationsRes.json();

      if (conversationsData.error) {
        console.error("Facebook Conversations Fetch Error:", conversationsData.error);

        if (pageId) {
          return NextResponse.json(
            { success: false, error: conversationsData.error.message },
            { status: 400 }
          );
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
        const customerInfo = participants.find((p: any) => p.id !== page.pageId) || participants[0];

        if (!customerInfo) continue;

        const customerId = customerInfo.id;
        const customerName = customerInfo.name;
        const conversationKey = `${page.pageId}:${customerId}`;
        const avatar = `https://graph.facebook.com/v19.0/${customerId}/picture?type=square`;
        const messagesUrl = `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,message,created_time,from,to,attachments{id,mime_type,name,size,file_url,image_data,video_data}&limit=20&access_token=${pageAccessToken}`;
        const messagesRes = await fetch(messagesUrl);
        const messagesData = await messagesRes.json();
        const fbMessages = messagesData.data || [];

        fbMessages.sort(
          (a: any, b: any) =>
            new Date(a.created_time).getTime() - new Date(b.created_time).getTime()
        );

        const chatHistory = fbMessages.flatMap((msg: any) => {
          const isFromPage = msg.from?.id === page.pageId;
          const attachments = msg.attachments?.data || [];
          const text = msg.message || "";

          if (attachments.length === 0) {
            return [{
              id: msg.id,
              sender: isFromPage ? "shop" : "customer",
              messageType: "text",
              text,
              timestamp: new Date(msg.created_time),
            }];
          }

          return attachments.map((attachment: any, attachmentIndex: number) => {
            const parsedAttachment = parseAttachment(attachment);
            const hasRenderableAttachment = !!parsedAttachment.image || !!parsedAttachment.fileUrl;
            const attachmentText =
              attachmentIndex === 0
                ? text || (hasRenderableAttachment ? "" : "Đính kèm không hỗ trợ xem trước")
                : "";

            return {
              id: attachment.id ? `${msg.id}-${attachment.id}` : `${msg.id}-${attachmentIndex}`,
              sender: isFromPage ? "shop" : "customer",
              text: attachmentText,
              timestamp: new Date(msg.created_time),
              ...parsedAttachment,
            };
          });
        }).filter((msg: any) => msg.text || msg.image || msg.fileUrl);

        const normalizedChatHistory = chatHistory.map((msg: any) => ({
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
            name: customerName,
            platform: "facebook",
            avatar,
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

    return NextResponse.json({
      success: true,
      data: {
        syncCount,
        pageCount: pages.length,
        pageResults,
      },
    });
  } catch (error: any) {
    console.error("POST /api/facebook/sync error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
