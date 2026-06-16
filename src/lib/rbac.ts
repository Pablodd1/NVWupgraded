import { NextResponse } from "next/server";
import { verifyToken } from "./auth";

export type UserRole = "customer" | "winery" | "admin";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  wineryId?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Verify JWT token and extract user information
 */
export async function authenticateRequest(request: Request): Promise<AuthenticatedUser | null> {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;)\s*token=([^;]+)/);
    const token = match ? match[1] : null;
    
    if (!token) {
      return null;
    }

    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || "customer",
      wineryId: decoded.wineryId,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 * Check if user has required role(s)
 */
export function hasRole(user: AuthenticatedUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: Request) {
  const user = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized - Please login" },
      { status: 401 }
    );
  }
  
  return user;
}

/**
 * Middleware to require specific role(s)
 */
export async function requireRole(request: Request, allowedRoles: UserRole[]) {
  const user = await authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized - Please login" },
      { status: 401 }
    );
  }
  
  if (!hasRole(user, allowedRoles)) {
    return NextResponse.json(
      { error: `Forbidden - Requires role: ${allowedRoles.join(" or ")}` },
      { status: 403 }
    );
  }
  
  return user;
}

/**
 * Middleware to require customer role
 */
export async function requireCustomer(request: Request) {
  return requireRole(request, ["customer"]);
}

/**
 * Middleware to require winery role
 */
export async function requireWinery(request: Request) {
  return requireRole(request, ["winery"]);
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(request: Request) {
  return requireRole(request, ["admin"]);
}

/**
 * Middleware to require winery or admin role
 */
export async function requireWineryOrAdmin(request: Request) {
  return requireRole(request, ["winery", "admin"]);
}

/**
 * Check if winery user owns the specific winery
 */
export function ownsWinery(user: AuthenticatedUser, wineryId: string): boolean {
  // Admin can access all wineries
  if (user.role === "admin") return true;
  
  // Winery user can only access their own winery
  if (user.role === "winery" && user.wineryId) {
    return user.wineryId === wineryId;
  }
  
  return false;
}

/**
 * Middleware to require winery ownership or admin
 */
export async function requireWineryOwnership(request: Request, wineryId: string) {
  const user = await requireWineryOrAdmin(request);
  
  if (user instanceof NextResponse) {
    return user; // Return error response
  }
  
  if (!ownsWinery(user, wineryId)) {
    return NextResponse.json(
      { error: "Forbidden - You don't have access to this winery" },
      { status: 403 }
    );
  }
  
  return user;
}
