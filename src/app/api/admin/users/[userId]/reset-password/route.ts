import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import { requireAdmin } from "@/lib/rbac";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();

    // Check admin auth - requireAdmin returns user object or error response
    const adminUser = await requireAdmin(req);
    if (adminUser instanceof NextResponse) {
      return adminUser; // Return error response
    }

    const { userId: targetUserId } = await params;
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      {
        message: "Password reset successfully",
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: error.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
