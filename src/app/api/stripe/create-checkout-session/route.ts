import UserModel from "@/models/user.model";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/dbConnect";
import { sendBookingEmails } from "@/lib/email";
import WineryModel from "@/models/winery.model";
import { getUserIdFromToken } from "@/lib/auth";
import BookingModel from "@/models/booking.model";

interface CheckoutSessionRequest {
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
  success_url: string;
  cancel_url: string;
  metadata: { itinerary: string };
  bookData: {};
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { bookData, line_items, success_url, cancel_url, metadata }: CheckoutSessionRequest = await req.json();

    const session = await stripe.checkout.sessions.create({
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

    if (!Array.isArray(bookData) || bookData.length === 0) {
      return NextResponse.json({ message: "Invalid booking bookData" }, { status: 400 });
    }

    const user = await UserModel.findById(userId).select("name email");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const booking = new BookingModel({ userId, payment_method: "pay_stripe" });
    booking.wineries = bookData.map((winery) => ({
      wineryId: winery.wineryId,
      datetime: winery.dateTime,
      tasting: winery.tasting,
      tour: winery.tour,
      foodPairings: winery.foodPairings,
    }));
    await booking.save();

    for (const winery of bookData) {
      const wineryDetails = await WineryModel.findById(winery.wineryId).select("name contact_info.email");
      if (wineryDetails) {
        await sendBookingEmails(
          booking.toJSON(),
          {
            wineryId: winery.wineryId,
            datetime: winery.dateTime,
            wineryName: wineryDetails.name,
            wineryEmail: wineryDetails.contact_info?.email,
          },
          user,
          "pending"
        );
      } else {
        console.warn(`Winery not found for ID: ${winery.wineryId}`);
      }
    }

    return NextResponse.json({ message: "success", sessionId: session.id, booking }, { status: 201 });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
