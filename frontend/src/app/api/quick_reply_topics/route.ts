import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { QuickReplyTopic } from "@/models/QuickReplyTopic";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const items = await QuickReplyTopic.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (!data.id) {
      data.id = "topic-" + Date.now();
    }
    
    if (data._id) {
      // Update
      const updated = await QuickReplyTopic.findOneAndUpdate({ id: data.id }, data, { new: true });
      return NextResponse.json({ success: true, data: updated });
    } else {
      // Insert
      const item = new QuickReplyTopic(data);
      await item.save();
      return NextResponse.json({ success: true, data: item });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }
    
    await QuickReplyTopic.findOneAndDelete({ id });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
