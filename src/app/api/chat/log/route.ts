import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import ChatLog from "@/models/chatLog.model";
import { getUserIdFromToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { messages, language } = await req.json();
        const userId = await getUserIdFromToken();

        // Check if there is an existing recent session for this user? 
        // For MVP, we just create a new log entry for every "turn" (or you could append to a session if you had a session ID).
        // Let's treat this as a "log event" - storing the pair (user msg + bot response)

        // Ideally, we'd pass a session ID from the client, but for simplicity/tracking purposes:
        const log = await ChatLog.create({
            userId: userId || undefined,
            messages: messages.map((m: any) => ({
                role: m.role,
                content: m.content,
                timestamp: new Date()
            })),
            language: language || 'en'
        });

        return NextResponse.json({ success: true, id: log._id }, { status: 201 });
    } catch (error: any) {
        console.error("Chat Log Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
