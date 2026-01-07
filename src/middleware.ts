import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ========================================
// SECURITY CONFIGURATION
// ========================================

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "100", 10);
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || "60000", 10);

// In-memory rate limit store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Verify JWT token
 */
async function verifyToken(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  return `${ip}-${userAgent.substring(0, 50)}`;
}

/**
 * Rate limiting check
 */
function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitStore.delete(identifier);
  }

  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  const current = rateLimitStore.get(identifier)!;

  if (current.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  current.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - current.count,
    resetTime: current.resetTime,
  };
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://maps.googleapis.com",
      "frame-src https://js.stripe.com",
    ].join("; ")
  );

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  // Strict Transport Security (HTTPS only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

/**
 * Simple bot detection
 */
function isPotentialBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
  ];
  return botPatterns.some((pattern) => pattern.test(userAgent));
}

// ========================================
// MIDDLEWARE
// ========================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get client identifier
  const clientId = getClientIdentifier(request);
  const userAgent = request.headers.get("user-agent") || "";

  // Bot detection for API routes
  if (pathname.startsWith("/api/") && isPotentialBot(userAgent)) {
    console.warn(`Potential bot detected: ${clientId}`);
    // Allow bots but log them - you can block if needed
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const rateLimit = checkRateLimit(clientId);

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );

      response.headers.set("X-RateLimit-Limit", RATE_LIMIT_MAX.toString());
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", rateLimit.resetTime.toString());
      response.headers.set("Retry-After", Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString());

      return addSecurityHeaders(response);
    }
  }

  // JWT Authentication for protected routes
  const isAdminRoute = pathname.startsWith("/admin/");
  const isWineryDashboard = pathname.startsWith("/winery-dashboard/");
  const isProtectedRoute = isAdminRoute || isWineryDashboard;

  if (isProtectedRoute) {
    // Use JWT_SECRET (Strictly server-side for security)
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET not configured!");
      return NextResponse.redirect(new URL("/", request.url));
    }

    const token = request.cookies.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const payload = await verifyToken(token.value, secret);

    if (!payload) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("token");
      return response;
    }

    // Role-based access control
    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isWineryDashboard && payload.role !== "winery") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Create response and add security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
