import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import Winery from "@/models/winery.model";
import User from "@/models/user.model";
import { sendHourReminder } from "@/lib/notifications";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Simple auth check for internal cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        // Find bookings starting between 55 and 65 minutes from now
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const windowStart = new Date(oneHourFromNow.getTime() - 5 * 60 * 1000);
        const windowEnd = new Date(oneHourFromNow.getTime() + 5 * 60 * 1000);

        const bookings = await BookingModel.find({
            status: 'confirmed',
            'wineries.datetime': {
                $gte: windowStart,
                $lte: windowEnd
            }
        });

        const sent = [];

        for (const booking of bookings) {
            const customer = await User.findById(booking.userId);
            if (!customer) continue;

            for (const wineryRef of booking.wineries) {
                // Only send if this specific winery's slot is in the window
                if (wineryRef.datetime >= windowStart && wineryRef.datetime <= windowEnd) {
                    const winery = await Winery.findById(wineryRef.wineryId);
                    if (winery) {
                        const timeStr = new Date(wineryRef.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        await sendHourReminder(customer, winery.name, timeStr);
                        sent.push({ customer: customer.email, winery: winery.name });
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            remindersSent: sent.length,
            details: sent
        });
    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
