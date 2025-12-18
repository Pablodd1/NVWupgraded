import BookingModel from "@/models/booking.model";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; status: string }> }) {
  const { id: bookingId, status } = await params;
  console.log({ bookingId, status });

  if (!["confirm", "cancel"].includes(status)) {
    return NextResponse.json({ error: 'Invalid status parameter. Use "confirm" or "cancel".' }, { status: 400 });
  }

  try {
    const booking = await BookingModel.findOne({ _id: bookingId });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    if (booking.status !== "pending") {
      return NextResponse.json({ error: "Only pending bookings can be updated." }, { status: 400 });
    }

    const newStatus = status === "confirm" ? "confirmed" : "cancelled";
    booking.status = newStatus;
    await booking.save();

    return NextResponse.json({ success: true, booking: booking.toJSON() });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
