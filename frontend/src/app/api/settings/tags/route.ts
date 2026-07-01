import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Tag } from "@/models/Tag";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const workspaceId = url.searchParams.get("workspaceId");
    
    const filter = workspaceId ? { workspaceId } : {};
    const tags = await Tag.find(filter);
    
    return NextResponse.json({ success: true, data: tags });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const newTag = await Tag.create(body);
    return NextResponse.json({ success: true, data: newTag }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
