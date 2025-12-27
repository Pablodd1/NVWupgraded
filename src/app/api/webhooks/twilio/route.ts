import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const body = formData.get("Body")?.toString().toUpperCase() || "";
        const from = formData.get("From")?.toString() || "";

        console.log(`Twilio Webhook Received: ${body} from ${from}`);

        if (["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(body.trim())) {
            await dbConnect();

            // Clean up phone number to match database format (assuming E.164)
            // If your DB stores phone numbers differently, you may need a more robust cleaner.
            const updatedUser = await User.findOneAndUpdate(
                { phone: from },
                { smsConsent: false },
                { new: true }
            );

            if (updatedUser) {
                console.log(`User ${updatedUser.email} unsubscribed from SMS via STOP keyword.`);
            }

            // Return TwiML response (empty)
            return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
                headers: { "Content-Type": "text/xml" },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Twilio Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
