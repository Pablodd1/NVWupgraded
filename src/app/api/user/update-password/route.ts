import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import { getUserIdFromToken } from "@/lib/auth";

export async function PUT(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 });
        }

        // Find user to check password and trigger validators
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // Assign new password
        user.password = newPassword;
        await user.save();

        return NextResponse.json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error: any) {
        console.error("Error updating password:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
