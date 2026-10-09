import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbConnect } from '@/lib/dbConnect';
import BookingModel from '@/models/booking.model';
import UserModel from '@/models/user.model';
import WineryModel from '@/models/winery.model';
import { sendBookingNotifications, sendMasterItineraryNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27.acacia' as any,
  });
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET is missing. Webhooks will not process.');
      return NextResponse.json({ error: 'Webhook secret is not set in environment' }, { status: 400 });
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const bookingId = session.metadata?.bookingId;
      if (!bookingId) {
        console.error('⚠️ No booking ID found in session metadata');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      await dbConnect();

      const booking = await BookingModel.findById(bookingId);
      if (!booking) {
        console.error(`⚠️ Booking not found for ID: ${bookingId}`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Idempotency: skip if already paid
      if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
        console.log(`ℹ️ Booking ${bookingId} already confirmed.`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Update Booking Status to Paid
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      await booking.save();

      console.log(`✅ Booking ${bookingId} successfully paid and confirmed via Webhook.`);

      // Send Emails asynchronously
      try {
        const user = await UserModel.findById(booking.userId);
        if (user) {
          // Send Master Itinerary to Guest
          const fullBooking = await BookingModel.findById(booking._id).populate("wineries.wineryId");
          await sendMasterItineraryNotification(fullBooking, user).catch(console.error);

          // Send individual emails to Wineries
          for (const wineryItem of booking.wineries) {
            const wineryDetails = await WineryModel.findById(wineryItem.wineryId).select("name contact_info.email contact_info.phone");
            if (wineryDetails) {
              await sendBookingNotifications({
                bookingId: booking._id.toString(),
                customerFirstName: user.firstName || "Guest",
                customerLastName: user.lastName || "",
                customerEmail: user.email || "",
                customerPhone: user.phone || "",
                wineryName: wineryDetails.name || "Unknown Winery",
                wineryEmail: wineryDetails.contact_info?.email || "",
                wineryPhone: wineryDetails.contact_info?.phone,
                bookingDateTime: wineryItem.datetime,
                numberOfGuests: wineryItem.numberOfGuests || 1,
                numberOfChildren: wineryItem.numberOfChildren || 0,
                numberOfNonDrinkers: wineryItem.numberOfNonDrinkers || 0,
                specialRequests: booking.specialRequests,
                paymentStatus: "paid"
              }).catch(console.error);
            }
          }
        }
      } catch (err) {
        console.error("⚠️ Failed to send notification emails during webhook processing:", err);
      }
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
