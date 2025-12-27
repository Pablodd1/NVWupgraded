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

    // Verify this booking includes the winery
    const hasWinery = booking.wineries.some(
      (w: any) => w.wineryId.toString() === winery._id.toString()
    );

    if (!hasWinery) {
      return NextResponse.json(
        { error: "This booking is not for your winery" },
        { status: 403 }
      );
    }

    // Restore slot capacity for declined booking
    for (const wineryBooking of booking.wineries) {
      if (wineryBooking.wineryId.toString() !== winery._id.toString()) continue;

      const bookingDate = new Date(wineryBooking.datetime);
      const date = bookingDate.toISOString().split('T')[0];
      const hour = bookingDate.getHours();

      let timeSlot = "Afternoon (12:00 PM - 3:00 PM)";
      if (hour >= 10 && hour < 12) {
        timeSlot = "Morning (10:00 AM - 12:00 PM)";
      } else if (hour >= 15 && hour < 18) {
        timeSlot = "Evening (3:00 PM - 6:00 PM)";
      }

      // Restore capacity (default to 1 guest if not specified)
      const guests = (wineryBooking as any).numberOfGuests || 1;
      const slot = await SlotInventory.findOne({
        wineryId: winery._id,
        date,
        timeSlot
      });

      if (slot) {
        slot.bookedCapacity = Math.max(0, slot.bookedCapacity - guests);
        slot.availableCapacity = Math.min(
          slot.totalCapacity,
          slot.availableCapacity + guests
        );
        await slot.save();
      }
    }

    // Update status
    booking.status = 'declined';
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
