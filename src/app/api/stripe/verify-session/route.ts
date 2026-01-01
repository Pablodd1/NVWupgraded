
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import UserModel from "@/models/user.model";
import WineryModel from "@/models/winery.model";
import { sendBookingNotifications, sendMasterItineraryNotification } from "@/lib/notifications";

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-01-27.acacia" as any,
    });
};

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ message: "Missing session ID" }, { status: 400 });
        }

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return NextResponse.json({ message: "Payment not completed" }, { status: 400 });
        }

        // Retrieve booking from metadata if stored, or find by user/time...
        // In create-checkout-session, we put { itinerary: JSON, bookData: ... } but maybe not bookingId?
        // Wait, I didn't add bookingId to metadata in the previous step.
        // But we can find the booking via the itinerary or just add bookingId to metadata now.
        // Actually, looking at the previous file content, it passes `metadata` from frontend to Stripe.
        // The frontend sends `metadata: { itinerary: JSON.stringify(data) }`.
        // The backend creates the booking.
        // I NEED to associate the Stripe Session with the Booking ID.
        // Best way: Update create-checkout-session to ADD bookingId to metadata.

        // For now, let's assume I fix create-checkout-session to add bookingId.
        const bookingId = session.metadata?.bookingId;

        if (!bookingId) {
            return NextResponse.json({ message: "No booking ID in session" }, { status: 400 });
        }

        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        // Idempotency check
        if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
            return NextResponse.json({ message: "Already confirmed", booking }, { status: 200 });
        }

        // Update Application Status
        booking.status = "confirmed";
        booking.paymentStatus = "paid";
        await booking.save();

        // --- SEND ALERTS ---
        // 1. Send ONE Master Itinerary Email
        const user = await UserModel.findById(booking.userId);
        if (user) {
            try {
                const fullBooking = await BookingModel.findById(booking._id).populate("wineries.wineryId");
                await sendMasterItineraryNotification(fullBooking, user);
            } catch (e) {
                console.error("Failed to send Master Itinerary (Verify):", e);
            }
        }

        // 2. Send Individual Notifications
        for (const wineryItem of booking.wineries) {
            const wineryDetails = await WineryModel.findById(wineryItem.wineryId).select("name contact_info.email contact_info.phone");
            if (wineryDetails) {
                try {
                    await sendBookingNotifications({
                        bookingId: booking._id.toString(),
                        customerFirstName: user?.firstName || "Guest",
                        customerLastName: user?.lastName || "",
                        customerEmail: user?.email || "",
                        customerPhone: user?.phone || "",
                        wineryName: wineryDetails.name || "Unknown Winery",
                        wineryEmail: wineryDetails.contact_info?.email || "",
                        wineryPhone: wineryDetails.contact_info?.phone,
                        bookingDateTime: wineryItem.datetime,
                        numberOfGuests: wineryItem.numberOfGuests || 1,
                        specialRequests: booking.specialRequests
                    });
                } catch (e) {
                    console.error("Failed to send winery notification:", e);
                }
            }
        }

        return NextResponse.json({ message: "Payment verified and booking confirmed", booking }, { status: 200 });

    } catch (error: any) {
        console.error("Verification error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

