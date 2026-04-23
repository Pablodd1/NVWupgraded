import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireWinery } from "@/lib/rbac";
import Winery from "@/models/winery.model";
import SlotInventory from "@/models/slotInventory.model";
import { autoGenerateWinerySlots } from "@/lib/slotGenerator";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const user = await requireWinery(request);
        if (user instanceof NextResponse) return user;

        const winery = await Winery.findOne({ owner: user.userId });
        if (!winery) {
            return NextResponse.json({ error: "Winery not found" }, { status: 404 });
        }

        // Get options from request
        const body = await request.json();
        const { daysAhead = 30, cleanExisting = false } = body;

        if (cleanExisting) {
            // Delete future slots for this winery before regenerating
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await SlotInventory.deleteMany({
                wineryId: winery._id,
                date: { $gte: today },
                bookedCapacity: 0 // Only delete slots that have no bookings to avoid data loss
            });
        }

        // Call the utility to generate slots
        await autoGenerateWinerySlots(winery, daysAhead);

        return NextResponse.json({
            success: true,
            message: `Slots regenerated for the next ${daysAhead} days.`
        }, { status: 200 });

    } catch (error: any) {
        console.error("Regenerate slots error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
