import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthUser, sanitizeUser } from "@/lib/auth";
import DashboardShell from "@/components/layout/DashboardShell";
import type { SafeUser } from "@/types/user";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: SafeUser | null = null;

  try {
    await connectDB();
    const auth = await getAuthUser();
    let userDoc = auth ? await User.findById(auth.userId) : null;
    if (!userDoc || !userDoc.isActive) {
      // Login is optional, fallback to first active user in DB so user settings function correctly
      userDoc = await User.findOne({ isActive: true });
    }
    if (userDoc) {
      user = sanitizeUser(userDoc);
    }
  } catch (error) {
    console.error("DashboardLayout auth fetch error:", error);
  }

  // If no user could be found in the database, use a default dummy user
  if (!user) {
    user = {
      id: "65a123456789012345678901",
      fullName: "Khách ẩn danh",
      email: "guest@pancake.vn",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    };
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
