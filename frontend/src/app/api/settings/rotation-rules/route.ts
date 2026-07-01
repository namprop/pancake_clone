import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { RotationRule } from "@/models/RotationRule";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId");
    
    const filter = workspaceId ? { workspaceId } : {};
    const rules = await RotationRule.find(filter).populate("assignedUsers.userId", "fullName email avatar");
    
    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const newRule = await RotationRule.create(body);
    return NextResponse.json({ success: true, data: newRule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
