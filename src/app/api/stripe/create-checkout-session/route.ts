export const dynamic = "force-dynamic";
import UserModel from "@/models/user.model";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/dbConnect";
import { sendBookingNotifications } from "@/lib/notifications";
import WineryModel from "@/models/winery.model";
import { getUserIdFromToken } from "@/lib/auth";
import BookingModel from "@/models/booking.model";
import SlotInventory from "@/models/slotInventory.model";

interface CheckoutSessionRequest {
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
  success_url: string;
  cancel_url: string;
  metadata: { itinerary: string };
  bookData: any[];
}

let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia" as any, // Use a modern version or omit for default
    });
  }
  return stripe;
};

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { bookData, line_items, success_url, cancel_url, metadata }: CheckoutSessionRequest = await req.json();

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url,
      cancel_url,
      metadata,
    });

    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const user = await UserModel.findById(userId).select("firstName lastName email phone");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // CRITICAL: Check slot availability and reserve capacity BEFORE creating Stripe session
    const reservationErrors = [];
    const reservedSlots = [];

    for (const wineryBooking of bookData) {
      const { wineryId, dateTime, numberOfGuests = 1 } = wineryBooking;

      if (!dateTime) {
        reservationErrors.push(`Missing booking date/time for winery ${wineryId}`);
        continue;
      }

      const bookingDate = new Date(dateTime);
      const date = bookingDate.toISOString().split('T')[0];

      // Determine time slot from booking time
      const hour = bookingDate.getHours();
      let timeSlot = "Afternoon (1:00 PM - 3:00 PM)";
      if (hour >= 10 && hour < 13) {
        timeSlot = "Morning (10:00 AM - 12:00 PM)";
      } else if (hour >= 15) {
        timeSlot = "Evening (4:00 PM - 6:00 PM)";
      }

      let slot = await SlotInventory.findOne({
        wineryId,
        date,
        timeSlot,
        status: { $ne: "blocked" }
      });

      // Auto-create slot if none exists (fallback for unseeded database)
      if (!slot) {
        try {
          slot = await SlotInventory.create({
            wineryId,
            date,
            timeSlot,
            totalCapacity: 20,
            bookedCapacity: 0,
            availableCapacity: 20,
            status: "available"
          });
        } catch (createError: any) {
          if (createError.code === 11000) {
            slot = await SlotInventory.findOne({ wineryId, date, timeSlot });
          } else {
            reservationErrors.push(`Failed to create slot for ${timeSlot} on ${date}`);
            continue;
          }
        }
      }

      if (!slot) {
        reservationErrors.push(`No availability found for ${timeSlot} on ${date}`);
        continue;
      }

      if (slot.availableCapacity < numberOfGuests) {
        reservationErrors.push(
          `Insufficient capacity: ${slot.availableCapacity} available, ${numberOfGuests} requested for ${timeSlot} on ${date}`
        );
        continue;
      }

      // Reserve capacity
      slot.bookedCapacity += numberOfGuests;
      slot.availableCapacity -= numberOfGuests;
      await slot.save();

      reservedSlots.push({
        slotId: slot._id,
        wineryId,
        guestsReserved: numberOfGuests
      });
    }

    // If any reservation failed, rollback
    if (reservationErrors.length > 0) {
      for (const reserved of reservedSlots) {
        const slot = await SlotInventory.findById(reserved.slotId);
        if (slot) {
          slot.bookedCapacity -= reserved.guestsReserved;
          slot.availableCapacity += reserved.guestsReserved;
          await slot.save();
        }
      }
      return NextResponse.json({ message: "Booking failed: Capacity issues", errors: reservationErrors }, { status: 400 });
    }

    // Calculate total price accurately
    const totalPrice = bookData.reduce((acc: number, item: any) => {
      let wineryTotal = 0;
      const guests = item.numberOfGuests || 1;
      if (item.tasting) wineryTotal += item.tasting * guests;
      item.foodPairings?.forEach((fp: any) => wineryTotal += (fp.price || 0) * guests);
      item.tours?.forEach((t: any) => wineryTotal += (t.price || 0) * guests);
      item.otherFeatures?.forEach((of: any) => wineryTotal += (Number(of.price) || 0) * guests);
      return acc + wineryTotal;
    }, 0);

    const booking = new BookingModel({
      userId,
      payment_method: "pay_stripe",
      totalPrice: totalPrice
    });

    booking.wineries = bookData.map((winery) => ({
      wineryId: winery.wineryId,
      datetime: winery.dateTime,
      tasting: winery.tasting,
      tours: winery.tours || [],
      foodPairings: winery.foodPairings || [],
      otherFeatures: winery.otherFeature || [],
      numberOfGuests: winery.numberOfGuests || 1
    }));
    await booking.save();

    // 1. Send ONE Master Itinerary Email to Customer
    try {
      const fullBooking = await BookingModel.findById(booking._id).populate("wineries.wineryId");
      await (await import("@/lib/notifications")).sendMasterItineraryNotification(fullBooking, user);
    } catch (e) {
      console.error("Failed to send Master Itinerary (Stripe):", e);
    }

    // 2. Send individual notifications to Each Winery
    for (const winery of bookData) {
      const wineryDetails = await WineryModel.findById(winery.wineryId).select("name contact_info.email contact_info.phone");
      if (wineryDetails) {
        try {
          await sendBookingNotifications({
            bookingId: booking._id.toString(),
            customerFirstName: user.firstName || "Guest",
            customerLastName: user.lastName || "",
            customerEmail: user.email,
            customerPhone: user.phone,
            wineryName: wineryDetails.name || "Unknown Winery",
            wineryEmail: wineryDetails.contact_info?.email || "",
            wineryPhone: wineryDetails.contact_info?.phone,
            bookingDateTime: winery.dateTime,
            numberOfGuests: winery.numberOfGuests || 1,
            specialRequests: booking.specialRequests
          });
        } catch (error) {
          console.error(`Failed to send notification for ${winery.wineryId}:`, error);
        }
      }
    }

    return NextResponse.json({ message: "success", sessionId: session.id, booking }, { status: 201 });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
