import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { WorkspaceSetting } from "@/models/WorkspaceSetting";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    let settings = await WorkspaceSetting.findOne({ workspaceId });
    if (!settings) {
      // Create default settings if none exist
      settings = await WorkspaceSetting.create({ workspaceId });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { workspaceId, tagSettings, interfaceSettings, generalSettings, quickReplySettings } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (tagSettings !== undefined) updateData.tagSettings = tagSettings;
    if (interfaceSettings !== undefined) updateData.interfaceSettings = interfaceSettings;
    if (generalSettings !== undefined) updateData.generalSettings = generalSettings;
    if (quickReplySettings !== undefined) updateData.quickReplySettings = quickReplySettings;

    const settings = await WorkspaceSetting.findOneAndUpdate(
      { workspaceId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
