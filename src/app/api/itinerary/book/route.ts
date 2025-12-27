import { getUserIdFromToken } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import UserModel from "@/models/user.model";
import WineryModel from "@/models/winery.model";
import SlotInventory from "@/models/slotInventory.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { sendBookingNotifications } from "@/lib/notifications";


export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const { data } = await req.json();
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ message: "Invalid booking data" }, { status: 400 });
    }

    const user = await UserModel.findById(userId).select("firstName lastName email phone");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // CRITICAL: Check slot availability and reserve capacity BEFORE creating booking
    const reservationErrors = [];
    const reservedSlots = [];

    for (const wineryBooking of data) {
      const { wineryId, dateTime, numberOfGuests = 1 } = wineryBooking;

      if (!dateTime) {
        reservationErrors.push(`Missing booking date/time for winery ${wineryId}`);
        continue;
      }

      // Parse date and time slot from datetime
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

      // Check if slot exists and has availability
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
            totalCapacity: 20, // Default capacity
            bookedCapacity: 0,
            availableCapacity: 20,
            status: "available"
          });
        } catch (createError: any) {
          // Handle duplicate key error (slot was created by concurrent request)
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

      // Reserve capacity (update inventory)
      slot.bookedCapacity += numberOfGuests;
      slot.availableCapacity -= numberOfGuests;
      await slot.save();

      reservedSlots.push({
        slotId: slot._id,
        wineryId,
        date,
        timeSlot,
        guestsReserved: numberOfGuests
      });
    }

    // If any reservation failed, rollback all reserved slots
    if (reservationErrors.length > 0) {
      // Rollback all successfully reserved slots
      for (const reserved of reservedSlots) {
        const slot = await SlotInventory.findById(reserved.slotId);
        if (slot) {
          slot.bookedCapacity -= reserved.guestsReserved;
          slot.availableCapacity += reserved.guestsReserved;
          await slot.save();
        }
      }

      return NextResponse.json(
        {
          message: "Booking failed: Capacity issues",
          errors: reservationErrors
        },
        { status: 400 }
      );
    }

    // All slots successfully reserved - calculate total price and create booking
    const firstWinery = data[0];
    const paymentMethod = firstWinery?.payment_method?.type || "pay_winery";

    // Calculate total price accurately
    const totalPrice = data.reduce((acc: number, item: any) => {
      let wineryTotal = 0;
      const guests = item.numberOfGuests || 1;

      // Tasting price per guest
      if (item.tasting) wineryTotal += item.tasting * guests;

      // Features, food, tours (assuming these are per guest or set prices)
      item.foodPairings?.forEach((fp: any) => wineryTotal += (fp.price || 0) * guests);
      item.tours?.forEach((t: any) => wineryTotal += (t.price || 0) * guests);
      item.otherFeatures?.forEach((of: any) => wineryTotal += (Number(of.price) || 0) * guests);

      return acc + wineryTotal;
    }, 0);

    const booking = new BookingModel({
      userId,
      payment_method: paymentMethod,
      totalPrice: totalPrice
    });

    booking.wineries = data.map((winery) => ({
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
      await (await import("@/lib/notifications")).sendMasterItineraryNotification(
        await BookingModel.findById(booking._id).populate("wineries.wineryId"),
        user
      );
    } catch (e) {
      console.error("Failed to send Master Itinerary:", e);
    }

    // 2. Send individual notifications to each Winery Owner
    const notificationResults = [];
    for (const winery of data) {
      const wineryDetails = await WineryModel.findById(winery.wineryId)
        .select("name contact_info.email contact_info.phone");

      if (wineryDetails) {
        try {
          const notificationResult = await sendBookingNotifications({
            bookingId: booking._id.toString(),
            customerFirstName: user.firstName || "Guest",
            customerLastName: user.lastName || "",
            customerEmail: user.email,
            customerPhone: user.phone,
            wineryName: wineryDetails.name,
            wineryEmail: wineryDetails.contact_info?.email || "",
            wineryPhone: wineryDetails.contact_info?.phone,
            bookingDateTime: winery.dateTime,
            numberOfGuests: winery.numberOfGuests || 1,
            specialRequests: booking.specialRequests
          });

          notificationResults.push({
            wineryId: winery.wineryId,
            wineryName: wineryDetails.name,
            notifications: notificationResult
          });
        } catch (error: any) {
          console.error(`Failed to send notifications for winery ${winery.wineryId}:`, error);
          notificationResults.push({
            wineryId: winery.wineryId,
            error: error.message
          });
        }
      } else {
        console.warn(`Winery not found for ID: ${winery.wineryId}`);
      }
    }

    return NextResponse.json({
      message: "Booking created successfully",
      booking: booking.toJSON(),
      notifications: notificationResults
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const bookings = await BookingModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: "$wineries" },
      {
        $lookup: {
          from: "wineries",
          let: { wineryId: "$wineries.wineryId" },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", { $toObjectId: "$$wineryId" }] } } }, { $project: { __v: 0 } }],
          as: "wineryDetails",
        },
      },
      { $unwind: { path: "$wineryDetails", preserveNullAndEmptyArrays: true } },
      { $addFields: { "wineries.winery": "$wineryDetails" } },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          specialRequests: { $first: "$specialRequests" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          wineries: { $push: "$wineries" },
          payment_method: { $first: "$payment_method" }, // Include payment method in the response
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalBookings = await BookingModel.countDocuments({ userId });
    return NextResponse.json({
      bookings,
      totalPages: Math.ceil(totalBookings / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}