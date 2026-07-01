import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ActivityLog } from "@/models/ActivityLog";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId");
    
    const filter = workspaceId ? { workspaceId } : {};
    const logs = await ActivityLog.find(filter).sort({ createdAt: -1 }).limit(100).populate("userId", "fullName email");
    
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
