/**
 * Security Utilities for Napa Valley Wineries
 * Implements rate limiting, input validation, sanitization, and security headers
 */

import { NextRequest, NextResponse } from "next/server";

// ========================================
// RATE LIMITING
// ========================================

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar distributed cache
 */
export function rateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = rateLimitStore[identifier];

    // Clean up expired entries
    if (record && now > record.resetTime) {
        delete rateLimitStore[identifier];
    }

    if (!rateLimitStore[identifier]) {
        rateLimitStore[identifier] = {
            count: 1,
            resetTime: now + windowMs,
        };
        return { success: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    const current = rateLimitStore[identifier];

    if (current.count >= maxRequests) {
        return { success: false, remaining: 0, resetTime: current.resetTime };
    }

    current.count++;
    return {
        success: true,
        remaining: maxRequests - current.count,
        resetTime: current.resetTime,
    };
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(request: NextRequest): string {
    // Try to get IP from various headers (for proxy/CDN support)
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");

    const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown";

    // Include user agent for additional uniqueness
    const userAgent = request.headers.get("user-agent") || "";

    return `${ip}-${userAgent.substring(0, 50)}`;
}

// ========================================
// INPUT SANITIZATION
// ========================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
    if (typeof input !== "string") return "";

    return input
        .replace(/[<>]/g, "") // Remove < and >
        .replace(/javascript:/gi, "") // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, "") // Remove event handlers
        .trim()
        .substring(0, 1000); // Limit length
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
    if (typeof email !== "string") return "";

    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(sanitized) ? sanitized : "";
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
    if (typeof phone !== "string") return "";

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, "");

    // Validate format (basic)
    if (cleaned.length < 10 || cleaned.length > 15) return "";

    return cleaned;
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
    if (typeof obj !== "object" || obj === null) {
        return typeof obj === "string" ? sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[sanitizeString(key)] = sanitizeObject(value);
    }

    return sanitized;
}

// ========================================
// VALIDATION
// ========================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Validate MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate number within range
 */
export function isValidNumber(
    value: any,
    min?: number,
    max?: number
): boolean {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
}

// ========================================
// SECURITY HEADERS
// ========================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
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

    // Strict Transport Security (HTTPS only)
    if (process.env.NODE_ENV === "production") {
        response.headers.set(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains; preload"
        );
    }

    return response;
}

// ========================================
// CORS CONFIGURATION
// ========================================

/**
 * Check if origin is allowed
 */
export function isAllowedOrigin(origin: string | null): boolean {
    if (!origin) return false;

    const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [
        process.env.NEXT_PUBLIC_APP_URL || "",
    ];

    return allowedOrigins.some((allowed) => origin === allowed.trim());
}

/**
 * Add CORS headers
 */
export function addCorsHeaders(
    response: NextResponse,
    origin: string | null
): NextResponse {
    if (isAllowedOrigin(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin!);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        response.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, X-CSRF-Token"
        );
    }

    return response;
}

// ========================================
// CSRF PROTECTION
// ========================================

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older environments
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(
    token: string | null,
    sessionToken: string | null
): boolean {
    if (!token || !sessionToken) return false;
    return token === sessionToken;
}

// ========================================
// REQUEST VALIDATION
// ========================================

/**
 * Validate request body size
 */
export function isValidBodySize(body: any, maxSizeKB: number = 100): boolean {
    try {
        const size = new Blob([JSON.stringify(body)]).size;
        return size <= maxSizeKB * 1024;
    } catch {
        return false;
    }
}

/**
 * Detect potential SQL injection patterns
 */
export function hasSqlInjection(input: string): boolean {
    const sqlPatterns = [
        /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
        /--/,
        /;/,
        /\/\*/,
        /\*\//,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Detect potential NoSQL injection
 */
export function hasNoSqlInjection(obj: any): boolean {
    if (typeof obj !== "object" || obj === null) return false;

    const dangerousKeys = ["$where", "$regex", "$ne", "$gt", "$lt"];

    if (Array.isArray(obj)) {
        return obj.some(hasNoSqlInjection);
    }

    for (const [key, value] of Object.entries(obj)) {
        if (dangerousKeys.includes(key)) return true;
        if (typeof value === "object" && hasNoSqlInjection(value)) return true;
    }

    return false;
}

// ========================================
// BOT DETECTION
// ========================================

/**
 * Simple bot detection based on user agent
 */
export function isPotentialBot(userAgent: string): boolean {
    const botPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python/i,
    ];

    return botPatterns.some((pattern) => pattern.test(userAgent));
}

// ========================================
// PASSWORD VALIDATION
// ========================================

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ========================================
// EXPORTS
// ========================================

export default {
    rateLimit,
    getClientIdentifier,
    sanitizeString,
    sanitizeEmail,
    sanitizePhone,
    sanitizeObject,
    isValidEmail,
    isValidPhone,
    isValidObjectId,
    isValidDate,
    isValidNumber,
    addSecurityHeaders,
    isAllowedOrigin,
    addCorsHeaders,
    generateCsrfToken,
    validateCsrfToken,
    isValidBodySize,
    hasSqlInjection,
    hasNoSqlInjection,
    isPotentialBot,
    isStrongPassword,
};
