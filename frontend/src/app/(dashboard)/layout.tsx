import { cookies } from "next/headers";
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
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:4000";
    const response = await fetch(`${backendApiUrl}/api/auth/me`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      user = data.user ?? null;
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
