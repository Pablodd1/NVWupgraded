import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireWinery } from "@/lib/rbac";
import BookingModel from "@/models/booking.model";
import Winery from "@/models/winery.model";
import User from "@/models/user.model";
import { sendFinalBookingDecision } from "@/lib/notifications";

// POST confirm booking
export async function POST(request: Request) {
  try {
    await dbConnect();

    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user;

    const winery = await Winery.findOne({ owner: user.userId });
    if (!winery) {
      return NextResponse.json({ error: "No winery found" }, { status: 404 });
    }

    const { bookingId } = await request.json();

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

    // Update individual status
    wineryBooking.status = 'confirmed';

    // Calculate Master Status
    const allStatuses = booking.wineries.map((w: any) => w.status);
    if (allStatuses.every((s: string) => s === 'confirmed')) {
      booking.status = 'confirmed';
    } else if (allStatuses.some((s: string) => s === 'confirmed')) {
      booking.status = 'partial'; // Or keep as pending/partial depending on UI logic
    }
    // If all declined? -> cancelled. logic can vary.

    await booking.save();

    // Send confirmation email/SMS to customer
    try {
      const customer = await User.findById(booking.userId).select("firstName email phone");
      if (customer) {
        await sendFinalBookingDecision(booking, winery, customer, 'confirmed');
      }
    } catch (e) {
      console.error("Failed to send confirmation notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      booking
    }, { status: 200 });
  } catch (error: any) {
    console.error("Confirm booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
