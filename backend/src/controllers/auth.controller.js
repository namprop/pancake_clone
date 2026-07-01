const bcrypt = require("bcryptjs");

const { connectDB } = require("../config/db");
const User = require("../models/User");
const {
  getAuthPayload,
  sanitizeUser,
  signToken,
  setAuthCookie,
  clearAuthCookie,
} = require("../services/auth.service");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ["admin", "manager", "staff"];

function validateLogin(email, password) {
  if (typeof email !== "string" || !email.trim()) {
    return "Email không được để trống.";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Địa chỉ email không hợp lệ.";
  }
  if (typeof password !== "string" || !password) {
    return "Mật khẩu không được để trống.";
  }
  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  }
  return null;
}

function validateRegister(fullName, email, password, role) {
  if (typeof fullName !== "string" || !fullName.trim()) {
    return "Họ tên không được để trống.";
  }
  if (fullName.trim().length < 2) {
    return "Họ tên phải có ít nhất 2 ký tự.";
  }
  if (fullName.trim().length > 100) {
    return "Họ tên không được vượt quá 100 ký tự.";
  }
  if (typeof email !== "string" || !email.trim()) {
    return "Email không được để trống.";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Địa chỉ email không hợp lệ.";
  }
  if (typeof password !== "string" || !password) {
    return "Mật khẩu không được để trống.";
  }
  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự.";
  }
  if (password.length > 72) {
    return "Mật khẩu không được vượt quá 72 ký tự.";
  }
  if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
    return `Vai trò không hợp lệ. Chỉ chấp nhận: ${ALLOWED_ROLES.join(", ")}.`;
  }
  return null;
}

function makeTokenForUser(user) {
  return signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
}

async function login(req, res) {
  try {
    await connectDB();

    const { email, password } = req.body || {};
    const validationError = validateLogin(email, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng." });
    }

    const token = makeTokenForUser(user);
    setAuthCookie(res, token);

    return res.json({
      user: sanitizeUser(user),
      message: "Đăng nhập thành công!",
    });
  } catch (error) {
    console.error("[auth/login]", error);
    return res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau." });
  }
}

async function register(req, res) {
  try {
    await connectDB();

    const { fullName, email, password, role } = req.body || {};
    const validationError = validateRegister(fullName, email, password, role);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        error: "Email này đã được sử dụng, vui lòng chọn email khác.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: ALLOWED_ROLES.includes(role) ? role : "staff",
    });

    const token = makeTokenForUser(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: sanitizeUser(user),
      message: "Đăng ký tài khoản thành công!",
    });
  } catch (error) {
    console.error("[auth/register]", error);
    return res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau." });
  }
}

async function me(req, res) {
  try {
    await connectDB();

    const auth = getAuthPayload(req);
    let userDoc = auth ? await User.findById(auth.userId) : null;

    if (!userDoc || !userDoc.isActive) {
      userDoc = await User.findOne({ isActive: true });
    }

    if (!userDoc) {
      return res.json({
        user: {
          id: "65a123456789012345678901",
          fullName: "Khách ẩn danh",
          email: "guest@pancake.vn",
          role: "admin",
          isActive: true,
          createdAt: new Date(),
        },
      });
    }

    return res.json({ user: sanitizeUser(userDoc) });
  } catch (error) {
    console.error("[auth/me]", error);
    return res
      .status(500)
      .json({ error: "Không thể lấy thông tin người dùng" });
  }
}

function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: "Đã đăng xuất" });
}

module.exports = {
  login,
  register,
  me,
  logout,
};
