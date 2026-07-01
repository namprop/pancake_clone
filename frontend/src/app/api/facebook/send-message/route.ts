import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Page } from "@/models/Page";
import { Customer } from "@/models/Customer";
import { decryptToken } from "@/lib/crypto";

import fs from "fs/promises";
import path from "path";

type OutgoingAttachmentType = "image" | "audio" | "video" | "file";

function getOutgoingAttachmentType(file: File): OutgoingAttachmentType {
  const type = file.type || "";
  const name = file.name || "";

  if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)) return "image";
  if (type.startsWith("video/") || /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(name)) return "video";
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(name)) return "audio";
  return "file";
}

function getOutgoingAttachmentSummary(type: OutgoingAttachmentType) {
  if (type === "image") return "[Hình ảnh]";
  if (type === "video") return "[Video]";
  if (type === "audio") return "[Âm thanh]";
  return "[File đính kèm]";
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const conversationId = formData.get("conversationId") as string;
    const pageId = formData.get("pageId") as string;
    const customerId = formData.get("customerId") as string;
    const text = formData.get("text") as string;
    const replyToStr = formData.get("replyTo") as string;
    let replyToObj = undefined;
    if (replyToStr) {
      try {
        replyToObj = JSON.parse(replyToStr);
      } catch (e) {}
    }
    
    const files: File[] = [];
    const urls: string[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file_") && value instanceof File) {
        files.push(value);
      } else if (key.startsWith("url_") && typeof value === "string") {
        urls.push(value);
      }
    }
    
    if (!customerId || (!text && files.length === 0 && urls.length === 0)) {
      return NextResponse.json({ success: false, error: "customerId và (text hoặc hình ảnh) là bắt buộc." }, { status: 400 });
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
    const targetConversationId =
      customerRecord?.pageId
        ? customerRecord.id
        : targetPageId
          ? `${targetPageId}:${targetCustomerId}`
          : customerId;

    // Find the active page
    const filter = targetPageId ? { pageId: targetPageId } : { isActive: true };
    const page = await Page.findOne(filter);
    
    if (!page) {
      return NextResponse.json({ success: false, error: "Không tìm thấy Page hoạt động để gửi tin." }, { status: 404 });
    }
    
    const pageAccessToken = decryptToken(page.pageAccessToken);
    const newMsgs = [];
    let lastMessageText = "";

    // Send text to Facebook
    if (text) {
      const sendUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
      
      const payload: any = {
        recipient: { id: targetCustomerId },
        message: { text: text }
      };
      if (replyToObj && replyToObj.messageId) {
        payload.reply_to = { mid: replyToObj.messageId };
      }

      const sendRes = await fetch(sendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const sendData = await sendRes.json();
      
      if (sendData.error) {
        console.error("Facebook Send Message Error:", sendData.error);
        return NextResponse.json({ success: false, error: sendData.error.message }, { status: 400 });
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

    // Save files locally and send to Facebook
    if (files.length > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const filepath = path.join(uploadsDir, filename);
        await fs.writeFile(filepath, buffer);
        
        const localUrl = `/uploads/${filename}`;
        const attachmentType = getOutgoingAttachmentType(file);
        
        // Send file to Facebook using FormData
        const fbFormData = new FormData();
        fbFormData.append("recipient", JSON.stringify({ id: targetCustomerId }));
        
        fbFormData.append("message", JSON.stringify({
          attachment: { type: attachmentType, payload: { is_reusable: false } }
        }));
        if (replyToObj && replyToObj.messageId) {
          fbFormData.append("reply_to", JSON.stringify({ mid: replyToObj.messageId }));
        }
        
        fbFormData.append("filedata", file);
        
        const fileSendUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
        const fileRes = await fetch(fileSendUrl, {
          method: "POST",
          body: fbFormData
        });
        
        const fileData = await fileRes.json();
        if (fileData.error) {
          console.error("Facebook Send Attachment Error:", fileData.error);
        } else {
          newMsgs.push({
            id: fileData.message_id || `msg-${Date.now()}-shop-${attachmentType}`,
            sender: "shop",
            messageType: attachmentType,
            text: "",
            image: attachmentType === "image" ? localUrl : undefined,
            fileUrl: attachmentType === "image" ? undefined : localUrl,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            timestamp: new Date(),
          });
          if (!lastMessageText) lastMessageText = getOutgoingAttachmentSummary(attachmentType);
        }
      }
    }

    // Process existing URLs if any (e.g. from favorites that already have real URLs)
    for (const url of urls) {
       // Assuming it's already uploaded or a valid public URL, send as URL attachment
       const sendUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`;
       
       const payload: any = {
         recipient: { id: targetCustomerId },
         message: { 
           attachment: { type: "image", payload: { url: url, is_reusable: true } }
         }
       };
       if (replyToObj && replyToObj.messageId) {
         payload.reply_to = { mid: replyToObj.messageId };
       }

       const sendRes = await fetch(sendUrl, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload)
       });
       
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
       return NextResponse.json({ success: false, error: "Gửi thất bại" }, { status: 400 });
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
    
    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error: any) {
    console.error("POST /api/facebook/send-message error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
