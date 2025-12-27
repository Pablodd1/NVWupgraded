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

    // Update status
    booking.status = 'confirmed';
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
