import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireWinery } from "@/lib/rbac";
import BookingModel from "@/models/booking.model";
import Winery from "@/models/winery.model";
import SlotInventory from "@/models/slotInventory.model";
import User from "@/models/user.model";
import { sendFinalBookingDecision } from "@/lib/notifications";

// POST decline booking
export async function POST(request: Request) {
  try {
    await dbConnect();

    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user;

    const winery = await Winery.findOne({ owner: user.userId });
    if (!winery) {
      return NextResponse.json({ error: "No winery found" }, { status: 404 });
    }

    const { bookingId, reason } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    // Find booking
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Find the specific winery subdocument
    const wineryBooking = booking.wineries.find(
      (w: any) => w.wineryId.toString() === winery._id.toString()
    );

    if (!wineryBooking) {
      return NextResponse.json(
        { error: "This booking is not for your winery" },
        { status: 403 }
      );
    }

    // Restore slot capacity for declined booking
    const bookingDate = new Date(wineryBooking.datetime);
    const date = bookingDate.toISOString().split('T')[0];
    const hour = bookingDate.getHours();

    // Logic from book/route.ts for consistency
    let timeSlot = "Afternoon (1:00 PM - 3:00 PM)";
    if (hour >= 10 && hour < 13) {
      timeSlot = "Morning (10:00 AM - 12:00 PM)";
    } else if (hour >= 15) {
      timeSlot = "Evening (4:00 PM - 6:00 PM)";
    }

    // Restore capacity atomically
    const guests = (wineryBooking as any).numberOfGuests || 1;
    await SlotInventory.findOneAndUpdate(
      {
        wineryId: winery._id,
        date,
        timeSlot
      },
      {
        $inc: { bookedCapacity: -guests, availableCapacity: guests }
      }
    );

    // Update individual status
    wineryBooking.status = 'declined';

    // Calculate Master Status
    // If ANY is declined, master could be 'partial' or 'cancelled' depending on preference.
    // If all are declined -> cancelled.
    // If some confirmed, some declined -> partial.
    const allStatuses = booking.wineries.map((w: any) => w.status);
    const hasConfirmed = allStatuses.includes('confirmed');
    const hasPending = allStatuses.includes('pending');

    if (allStatuses.every((s: string) => s === 'declined')) {
      booking.status = 'cancelled';
    } else if (hasConfirmed || hasPending) {
      booking.status = 'partial';
    } else {
      // Should cover all cases, but fallback
      booking.status = 'cancelled';
    }

    await booking.save();

    // Send decline email to customer with reason
    try {
      const customer = await User.findById(booking.userId).select("firstName email phone");
      if (customer) {
        await sendFinalBookingDecision(booking, winery, customer, 'declined', reason);
      }
    } catch (e) {
      console.error("Failed to send decline notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Booking declined",
      booking,
      reason
    }, { status: 200 });
  } catch (error: any) {
    console.error("Decline booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
