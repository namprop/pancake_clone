import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy file tải lên" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Chỉ hỗ trợ tải ảnh" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const extension = path.extname(file.name) || ".png";
    const safeBaseName = path
      .basename(file.name, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);
    const filename = `${Date.now()}-${safeBaseName}${extension}`;
    const filepath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      data: {
        name: file.name,
        url: `/uploads/${filename}`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
