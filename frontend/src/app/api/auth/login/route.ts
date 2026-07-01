import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AUTH_COOKIE, signToken, sanitizeUser } from "@/lib/auth";

// ── Validation helpers ─────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(email: unknown, password: unknown): string | null {
  if (typeof email !== "string" || !email.trim())
    return "Email không được để trống.";
  if (!EMAIL_REGEX.test(email.trim()))
    return "Địa chỉ email không hợp lệ.";
  if (typeof password !== "string" || !password)
    return "Mật khẩu không được để trống.";
  if (password.length < 6)
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  return null;
}

// ── POST /api/auth/login ───────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    await connectDB();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
    }

    const { email, password } = body as Record<string, unknown>;

    // — Validate input
    const validationError = validateLogin(email, password);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();

    // — Tìm user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng." },
        { status: 401 }
      );
    }

    // — Kiểm tra mật khẩu
    const isValid = await bcrypt.compare(password as string, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không đúng." },
        { status: 401 }
      );
    }

    // — Ký JWT
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      user: sanitizeUser(user),
      message: "Đăng nhập thành công!",
    });

    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json(
      { error: "Lỗi server, vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
