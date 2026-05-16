import BookingModel from "@/models/booking.model";
import { NextResponse } from "next/server";
import User from "@/models/user.model";
import Winery from "@/models/winery.model";
import { sendFinalBookingDecision } from "@/lib/notifications";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; status: string }> }) {
  const { id: bookingId, status } = await params;
  console.log({ bookingId, status });

  if (!["confirm", "cancel", "complete"].includes(status)) {
    return NextResponse.json({ error: 'Invalid status parameter. Use "confirm", "cancel", or "complete".' }, { status: 400 });
  }

  try {
    const booking = await BookingModel.findOne({ _id: bookingId });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (status === "complete") {
      if (booking.status !== "confirmed") {
        return NextResponse.json({ error: "Only confirmed bookings can be completed." }, { status: 400 });
      }
    } else if (booking.status !== "pending") {
      return NextResponse.json({ error: "Only pending bookings can be updated." }, { status: 400 });
    }

    const newStatus = status === "confirm" ? "confirmed" :
      status === "cancel" ? "cancelled" : "completed";
    booking.status = newStatus;
    await booking.save();

    // Notify Customer of Admin Decision
    try {
      const user = await User.findById(booking.userId);
      const firstWinery = await Winery.findById(booking.wineries[0].wineryId);

      if (user && firstWinery) {
        // 'cancelled' in admin translates to 'declined' in our notification template for customer clarity
        await sendFinalBookingDecision(
          booking,
          firstWinery,
          user,
          newStatus === "confirmed" ? "confirmed" : "declined"
        );
      }
    } catch (e) {
      console.error("Admin notification failure:", e);
    }

    return NextResponse.json({ success: true, booking: booking.toJSON() });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
