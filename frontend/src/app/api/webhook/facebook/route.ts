import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || "dev-webhook-verify-token";

    if (mode === "subscribe" && token === verifyToken) {
      return new Response(challenge, { status: 200 });
    }

    return new Response("Forbidden", { status: 403 });
  } catch (error: any) {
    console.error("Facebook Webhook GET error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await req.json();
    
    // Log the incoming webhook event
    console.log("Facebook Webhook Payload Received:", JSON.stringify(payload, null, 2));
    
    // Always return 200 OK to Meta
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Facebook Webhook POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
