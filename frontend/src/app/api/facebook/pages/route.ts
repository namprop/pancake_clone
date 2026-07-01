import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Page } from "@/models/Page";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get current user or fallback to first active user in DB
    const auth = await getAuthUser();
    let userDoc = auth ? await User.findById(auth.userId) : null;
    if (!userDoc || !userDoc.isActive) {
      userDoc = await User.findOne({ isActive: true });
    }
    
    // Resilient fallback: if no active user found, find any user
    if (!userDoc) {
      userDoc = await User.findOne();
    }
    
    // Resilient fallback: if still no user in DB, auto-create the guest/demo admin user
    if (!userDoc) {
      try {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        userDoc = await User.create({
          _id: "65a123456789012345678901",
          fullName: "Khách ẩn danh",
          email: "guest@pancake.vn",
          password: hashedPassword,
          role: "admin",
          isActive: true
        });
        console.log("Auto-created default admin user in DB:", userDoc._id);
      } catch (err) {
        console.error("Failed to auto-create default admin user:", err);
      }
    }
    
    if (!userDoc) {
      return NextResponse.json({ success: false, data: [] });
    }
    
    const pages = await Page.find({ userId: userDoc._id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    console.error("GET /api/facebook/pages error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
