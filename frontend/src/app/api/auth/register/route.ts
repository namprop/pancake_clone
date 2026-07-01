import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AUTH_COOKIE, signToken, sanitizeUser } from "@/lib/auth";
import type { UserRole } from "@/types/user";

// ── Validation helpers ─────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES: UserRole[] = ["admin", "manager", "staff"];

function validateRegister(
  fullName: unknown,
  email: unknown,
  password: unknown,
  role: unknown
): string | null {
  if (typeof fullName !== "string" || !fullName.trim())
    return "Họ tên không được để trống.";
  if (fullName.trim().length < 2)
    return "Họ tên phải có ít nhất 2 ký tự.";
  if (fullName.trim().length > 100)
    return "Họ tên không được vượt quá 100 ký tự.";

  if (typeof email !== "string" || !email.trim())
    return "Email không được để trống.";
  if (!EMAIL_REGEX.test(email.trim()))
    return "Địa chỉ email không hợp lệ.";

  if (typeof password !== "string" || !password)
    return "Mật khẩu không được để trống.";
  if (password.length < 6)
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  if (password.length > 72)
    return "Mật khẩu không được vượt quá 72 ký tự.";

  if (role !== undefined && !ALLOWED_ROLES.includes(role as UserRole))
    return `Vai trò không hợp lệ. Chỉ chấp nhận: ${ALLOWED_ROLES.join(", ")}.`;

  return null;
}

// ── POST /api/auth/register ────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    await connectDB();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
    }

    const { fullName, email, password, role } = body as Record<string, unknown>;

    // — Validate input
    const validationError = validateRegister(fullName, email, password, role);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    // — Kiểm tra email đã tồn tại chưa
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng, vui lòng chọn email khác." },
        { status: 409 }
      );
    }

    // — Hash mật khẩu và tạo user
    const hashedPassword = await bcrypt.hash(password as string, 12);
    const user = await User.create({
      fullName: (fullName as string).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: (ALLOWED_ROLES.includes(role as UserRole) ? role : "staff") as UserRole,
    });

    // — Ký JWT
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      { user: sanitizeUser(user), message: "Đăng ký tài khoản thành công!" },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json(
      { error: "Lỗi server, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
