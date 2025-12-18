import { getUserIdFromToken } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import SlotInventory from "@/models/slotInventory.model";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ booking_id: string }> }) {
  const userId = await getUserIdFromToken();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { booking_id: bookingId } = await params;

  if (!bookingId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  await dbConnect();
  const booking = await BookingModel.findOne({ _id: bookingId, userId });

  if (!booking) {
    return NextResponse.json({ message: "Booking not found" }, { status: 404 });
  }

  // Restore slot capacity for all wineries in the cancelled booking
  for (const wineryBooking of booking.wineries) {
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
      wineryId: wineryBooking.wineryId,
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

  booking.status = "cancelled";
  await booking.save();

  return NextResponse.json({ message: "Booking cancelled successfully and capacity restored", booking }, { status: 200 });
}
