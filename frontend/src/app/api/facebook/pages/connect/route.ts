import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Page } from "@/models/Page";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { pageId, isActive } = body;
    
    if (!pageId) {
      return NextResponse.json({ success: false, error: "pageId là bắt buộc." }, { status: 400 });
    }
    
    const updatedPage = await Page.findOneAndUpdate(
      { pageId },
      { isActive: !!isActive },
      { new: true }
    );
    
    if (!updatedPage) {
      return NextResponse.json({ success: false, error: "Không tìm thấy Page." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: updatedPage });
  } catch (error: any) {
    console.error("POST /api/facebook/pages/connect error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
