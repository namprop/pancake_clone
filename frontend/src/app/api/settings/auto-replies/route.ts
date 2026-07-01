import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AutoReply } from "@/models/AutoReply";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId");
    
    const filter = workspaceId ? { workspaceId } : {};
    const autoReplies = await AutoReply.find(filter);
    
    return NextResponse.json({ success: true, data: autoReplies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const newRule = await AutoReply.create(body);
    return NextResponse.json({ success: true, data: newRule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
