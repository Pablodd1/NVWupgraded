
import { NextResponse } from 'next/server';
import { sendErrorNotification } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const { error, stack, url, userId, userAgent, additionalInfo } = await req.json();

        await sendErrorNotification({
            error,
            source: 'client',
            stack,
            url,
            userId,
            userAgent,
            additionalInfo
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Failed to process error log:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
