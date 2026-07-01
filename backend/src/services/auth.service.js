const jwt = require("jsonwebtoken");

const AUTH_COOKIE = "pancake_token";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT Verify Error:", error.message);
    return null;
  }
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

function getCookieValue(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!target) return null;

  return decodeURIComponent(target.slice(name.length + 1));
}

function getAuthPayload(req) {
  const token = getCookieValue(req, AUTH_COOKIE);
  if (!token) return null;
  return verifyToken(token);
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

function clearAuthCookie(res) {
  res.cookie(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

module.exports = {
  AUTH_COOKIE,
  signToken,
  verifyToken,
  sanitizeUser,
  getAuthPayload,
  setAuthCookie,
  clearAuthCookie,
};
