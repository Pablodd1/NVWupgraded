import { jwtVerify } from "jose"; // jose is Edge-runtime compatible
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to verify the token using jose
async function verifyToken(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin/");
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET;

  if (isAdminRoute && secret) {
    const token = request.cookies.get("token");
    if (!token) return NextResponse.redirect(new URL("/", request.url));
    const payload = await verifyToken(token.value, secret);

    if (!payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}
