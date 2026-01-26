import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

// Support request logging model (inline to avoid additional model file)
interface SupportRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  status: "pending" | "in_progress" | "resolved";
}

/**
 * POST /api/support
 * Handles support form submissions
 * Logs to database and (in future) sends email notifications
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Log the support request (in production, this would be stored in a collection)
    const supportRequest: SupportRequest = {
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
      status: "pending"
    };

    // Log to console for now (in production, save to MongoDB + send email)
    console.log("=== NEW SUPPORT REQUEST ===");
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Time: ${supportRequest.createdAt.toISOString()}`);
    console.log("=== END SUPPORT REQUEST ===");

    // TODO: In production, implement:
    // 1. Save to SupportRequest collection in MongoDB
    // 2. Send email notification to support@napavalleywineries.com
    // 3. Send auto-reply email to customer

    // Return success
    return NextResponse.json({
      success: true,
      message: "Support request received. We'll respond within 24 hours.",
      ticketId: `NVW-${Date.now().toString(36).toUpperCase()}`
    });

  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json(
      { error: "Failed to submit support request" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/support
 * Returns support contact information
 */
export async function GET() {
  return NextResponse.json({
    email: "support@napavalleywineries.com",
    responseTime: "24 hours",
    channels: [
      { type: "email", address: "support@napavalleywineries.com" },
      { type: "chat", description: "AI Concierge - available 24/7" },
      { type: "social", platforms: ["Instagram", "Facebook"] }
    ],
    businessHours: "24/7 AI Support, Human response within 24 hours"
  });
}
