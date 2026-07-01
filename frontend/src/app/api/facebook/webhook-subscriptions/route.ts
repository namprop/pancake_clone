import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Page } from "@/models/Page";
import { decryptToken } from "@/lib/crypto";
import { subscribePageToFacebookWebhooks } from "@/lib/facebook-subscriptions";

export const runtime = "nodejs";

export async function POST() {
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
        results.push({
          ...result,
          pageName: page.pageName,
        });
      } catch (error: any) {
        results.push({
          pageId: page.pageId,
          pageName: page.pageName,
          success: false,
          error: error.message,
        });
      }
    }

    console.log("Facebook webhook subscription results:", results);

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("POST /api/facebook/webhook-subscriptions error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
