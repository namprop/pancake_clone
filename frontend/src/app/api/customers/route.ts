import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { Page } from "@/models/Page";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const activePages = await Page.find({ isActive: true }).select("pageId");
    const activePageIds = activePages.map((page) => page.pageId);
    const customers = await Customer.find({
      $or: [
        { platform: { $ne: "facebook" } },
        { pageId: { $in: activePageIds } },
      ],
    }).sort({ timestamp: -1 });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    const customer = new Customer(data);
    await customer.save();
    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { customerId, fields } = await req.json();

    if (!customerId || !fields || typeof fields !== "object") {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin khách hàng cần cập nhật" },
        { status: 400 }
      );
    }

    const allowedFields = new Set([
      "name",
      "phone",
      "address",
      "provinceCode",
      "districtCode",
      "wardCode",
      "notes",
      "gender",
      "birthday",
      "assigneeName",
      "assignedAt",
      "isResolved",
      "resolvedAt",
      "unreadCount",
    ]);
    const update: Record<string, unknown> = {};

    Object.entries(fields).forEach(([key, value]) => {
      if (allowedFields.has(key)) {
        update[key] = value;
      }
    });

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: "Không có trường hợp lệ để cập nhật" },
        { status: 400 }
      );
    }

    const customer = await Customer.findOneAndUpdate(
      { id: customerId },
      { $set: update },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
