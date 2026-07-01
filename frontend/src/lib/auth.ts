import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { IUser } from "@/types/user";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const secretKey = new TextEncoder().encode(JWT_SECRET);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";
export const AUTH_COOKIE = "pancake_token";

export interface JwtPayload {
  userId: string;
  email: string;
  role: IUser["role"];
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error("JWT Verify Error:", error);
    return null;
  }
}

export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
