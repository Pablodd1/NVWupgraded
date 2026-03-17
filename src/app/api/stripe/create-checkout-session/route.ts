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

    // 1. Check slot availability and reserve capacity
    const reservationErrors = [];
    const reservedSlots = [];

    for (const wineryBooking of bookData) {
      const { wineryId, dateTime, numberOfGuests = 1, numberOfChildren = 0, numberOfNonDrinkers = 0 } = wineryBooking;
      const totalCapacityNeeded = numberOfGuests + numberOfChildren + numberOfNonDrinkers;

      if (!dateTime) {
        reservationErrors.push(`Missing booking date/time for winery ${wineryId}`);
        continue;
      }

      const bookingDate = new Date(dateTime);
      const date = bookingDate.toISOString().split('T')[0];
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
          slot = await SlotInventory.findOne({ wineryId, date, timeSlot });
        }
      }

      if (!slot || slot.availableCapacity < totalCapacityNeeded) {
        reservationErrors.push(`Insufficient capacity for ${wineryBooking.wineryId}`);
        continue;
      }

      slot.bookedCapacity += totalCapacityNeeded;
      slot.availableCapacity -= totalCapacityNeeded;
      await slot.save();

      reservedSlots.push({
        slotId: slot._id,
        wineryId,
        guestsReserved: totalCapacityNeeded
      });
    }

    if (reservationErrors.length > 0) {
      // Rollback
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

    // 2. Prepare Booking Object
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Pre-fetch wineries to get up-to-date pricing
    const wineryIds = bookData.map((d: any) => d.wineryId);
    const wineries = await WineryModel.find({ _id: { $in: wineryIds } });

    const totalPrice = bookData.reduce((acc: number, item: any) => {
      let wineryTotal = 0;
      const guests = Number(item.numberOfGuests) || 1;
      const children = Number(item.numberOfChildren) || 0;
      const nonDrinkers = Number(item.numberOfNonDrinkers) || 0;
      const foodQty = Number(item.foodPairingQty) || 1;
      const winery = wineries.find(w => w._id.toString() === item.wineryId.toString());

      if (winery) {
        // Find the specific tasting being booked
        const tasting = winery.tasting_info.find((t: any) => t.tasting_title === item.tastingTitle)
          || winery.tasting_info[item.tastingIndex || 0]
          || winery.tasting_info[0];

        if (tasting) {
          const pricePerPerson = Number(tasting.tasting_price) || 0;
          wineryTotal += pricePerPerson * guests;

          // Add guest type pricing
          wineryTotal += (Number(tasting.child_price) || 0) * children;
          wineryTotal += (Number(tasting.non_drinker_price) || 0) * nonDrinkers;
        }
      }

      // Add features, food, tours
      item.foodPairings?.forEach((fp: any) => wineryTotal += (Number(fp.price) || 0) * foodQty);
      item.tours?.forEach((t: any) => wineryTotal += (Number(t.price) || 0) * guests);
      item.otherFeatures?.forEach((of: any) => wineryTotal += (Number(of.price) || 0) * guests);

      return acc + wineryTotal;
    }, 0);

    const booking = new BookingModel({
      userId,
      payment_method: "pay_stripe",
      paymentStatus: "pending",
      status: "pending",
      totalPrice,
      totalAmount: totalPrice,
      wineries: bookData.map((winery: any) => {
        const wineryDetails = wineries.find(w => w._id.toString() === winery.wineryId.toString());
        const tasting = wineryDetails?.tasting_info?.find((t: any) => t.tasting_title === winery.tastingTitle)
          || wineryDetails?.tasting_info?.[winery.tastingIndex || 0]
          || wineryDetails?.tasting_info?.[0];

        return {
          wineryId: winery.wineryId,
          datetime: winery.dateTime,
          tasting: winery.tasting,
          tasting_price: tasting?.tasting_price || 0,
          childPrice: tasting?.child_price || 0,
          nonDrinkerPrice: tasting?.non_drinker_price || 0,
          tours: winery.tours || [],
          foodPairings: winery.foodPairings || [],
          foodPairingQty: winery.foodPairingQty || 1,
          otherFeatures: winery.otherFeature || [],
          numberOfGuests: winery.numberOfGuests || 1,
          numberOfChildren: winery.numberOfChildren || 0,
          numberOfNonDrinkers: winery.numberOfNonDrinkers || 0,
        };
      })
    });

    // 3. Create Stripe Session with Booking ID in Metadata
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url,
      cancel_url,
      metadata: {
        ...metadata,
        bookingId: booking._id.toString()
      },
    });

    // 4. Save Booking
    await booking.save();

    return NextResponse.json({ message: "success", sessionId: session.id, booking }, { status: 201 });

    return NextResponse.json({ message: "success", sessionId: session.id, booking }, { status: 201 });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
