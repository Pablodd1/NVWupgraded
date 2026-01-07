import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import { sendPasswordResetEmail } from "@/lib/notifications";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email } = await request.json();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Security: Don't reveal if user exists
            return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });
        }

        // Generate secure token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Send email
        await sendPasswordResetEmail(user.email, resetToken);

        return NextResponse.json({ success: true, message: "Reset link sent" });
    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
