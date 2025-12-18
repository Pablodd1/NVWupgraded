import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || "";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "customer" | "winery" | "admin";
  wineryId?: string;
  firstName?: string;
  lastName?: string;
}

export function createToken(payload: TokenPayload) {
  if (!SECRET) {
    throw new Error("JWT secret is not set. Please define JWT_SECRET in .env.local");
  }
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!SECRET) {
      return null;
    }
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setTokenCookie(token: string) {
  const cookie = await cookies();
  cookie.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getUserIdFromToken() {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) return null;

  try {
    if (!SECRET) {
      return null;
    }
    const decoded = jwt.verify(token, SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function removeToken() {
  const cookie = await cookies();
  cookie.set("token", "", { maxAge: -1 });
}
