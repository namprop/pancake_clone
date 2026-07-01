import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { WorkspaceSetting } from "@/models/WorkspaceSetting";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();

    const workspaceId = "default-workspace";

    const updated = await WorkspaceSetting.findOneAndUpdate(
      { workspaceId },
      { $set: { generalSettings: data } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
