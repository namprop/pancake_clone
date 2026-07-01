import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImageFolder } from "@/models/ImageFolder";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const folders = await ImageFolder.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: folders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (!data.id) {
      data.id = "folder-" + Date.now();
    }
    
    const folder = new ImageFolder({
      id: data.id,
      name: data.name
    });
    
    await folder.save();
    return NextResponse.json({ success: true, data: folder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
