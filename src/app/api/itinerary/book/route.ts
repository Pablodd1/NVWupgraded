import { getUserIdFromToken } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import UserModel from "@/models/user.model";
import WineryModel from "@/models/winery.model";
import SlotInventory from "@/models/slotInventory.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { sendBookingNotifications, sendMasterItineraryNotification } from "@/lib/notifications";


export async function POST(req: NextRequest) {
  const reservedSlots: Array<{ slotId: any; wineryId: any; date: string; timeSlot: string; guestsReserved: number }> = [];
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

    // CRITICAL: Check slot availability and reserve capacity Atomicly
    const reservationErrors: string[] = [];

    for (const wineryBooking of data) {
      const { wineryId, dateTime, numberOfGuests = 1, numberOfChildren = 0, numberOfNonDrinkers = 0 } = wineryBooking;
      const totalCapacityNeeded = numberOfGuests + numberOfChildren + numberOfNonDrinkers;

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

      // 1. Try to atomically find and update an existing slot with sufficient capacity
      let slot = await SlotInventory.findOneAndUpdate(
        {
          wineryId,
          date,
          timeSlot,
          status: { $ne: "blocked" },
          availableCapacity: { $gte: totalCapacityNeeded }
        },
        {
          $inc: { bookedCapacity: totalCapacityNeeded, availableCapacity: -totalCapacityNeeded }
        },
        { new: true }
      );

      // 2. If no slot found, check why
      if (!slot) {
        const existingSlot = await SlotInventory.findOne({ wineryId, date, timeSlot });

        if (existingSlot) {
          // Slot exists but failed the update -> likely insufficient capacity or blocked
          reservationErrors.push(`Insufficient capacity or blocked slot for ${timeSlot} on ${date}`);
          continue;
        } else {
          // Slot does not exist -> Create it with atomic reservation
          try {
            // Create with initial reservation to prevent race condition
            slot = await SlotInventory.create({
              wineryId,
              date,
              timeSlot,
              totalCapacity: 20, // Default capacity
              bookedCapacity: totalCapacityNeeded,
              availableCapacity: 20 - totalCapacityNeeded,
              status: "available"
            });
          } catch (createError: any) {
            // Handle race condition: Duplicate key error means someone else created it
            if (createError.code === 11000) {
              // Retry reservation on the now-existing slot
              slot = await SlotInventory.findOneAndUpdate(
                {
                  wineryId,
                  date,
                  timeSlot,
                  status: { $ne: "blocked" },
                  availableCapacity: { $gte: totalCapacityNeeded }
                },
                {
                  $inc: { bookedCapacity: totalCapacityNeeded, availableCapacity: -totalCapacityNeeded }
                },
                { new: true }
              );

              if (!slot) {
                reservationErrors.push(`Capacity exhausted during race condition for ${timeSlot} on ${date}`);
                continue;
              }
            } else {
              reservationErrors.push(`Failed to create/reserve slot for ${timeSlot} on ${date}`);
              continue;
            }
          }
        }
      }

      if (slot) {
        reservedSlots.push({
          slotId: slot._id,
          wineryId,
          date,
          timeSlot,
          guestsReserved: totalCapacityNeeded
        });
      }
    }

    // If any reservation failed, rollback all reserved slots
    if (reservationErrors.length > 0) {
      console.warn("Booking failed, rolling back reservations:", reservationErrors);
      // Rollback all successfully reserved slots
      for (const reserved of reservedSlots) {
        await SlotInventory.findByIdAndUpdate(reserved.slotId, {
          $inc: { bookedCapacity: -reserved.guestsReserved, availableCapacity: reserved.guestsReserved }
        });
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
    const firstWineryData = data[0];
    const paymentMethod = firstWineryData?.payment_method?.type || "pay_winery";

    // Pre-fetch wineries to get up-to-date pricing/fees
    const wineryIds = data.map((d: any) => d.wineryId);
    const wineries = await WineryModel.find({ _id: { $in: wineryIds } });

    // Calculate total price accurately
    const totalPrice = data.reduce((acc: number, item: any) => {
      let wineryTotal = 0;
      const guests = Number(item.numberOfGuests) || 1;
      const children = Number(item.numberOfChildren) || 0;
      const nonDrinkers = Number(item.numberOfNonDrinkers) || 0;
      const foodQty = Number(item.foodPairingQty) || 1;
      const winery = wineries.find(w => w._id.toString() === item.wineryId.toString());

      if (winery) {
        // Find the specific tasting being booked
        const tasting = winery.tasting_info.find((t: any) => t.tasting_title === item.tastingTitle)
          || winery.tasting_info[0];

        if (tasting) {
          // Check max guests condition
          const maxGuests = tasting.booking_info?.max_guests_per_slot || 20;

          if (guests > maxGuests) {
            throw new Error(`Winery ${winery.name} only allows up to ${maxGuests} guests per slot.`);
          }

          // Calculation: Per Person Fee * Number of Guests
          const pricePerPerson = Number(tasting.tasting_price) || 0;
          wineryTotal += pricePerPerson * guests;

          // Add children and non-drinkers pricing
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
      payment_method: paymentMethod,
      totalPrice: totalPrice,
      status: "confirmed", // Mark as confirmed for mock checkout
      paymentStatus: "paid", // Mark as paid for mock checkout
      paymentMethod: "stripe" // Simulation
    });

    booking.wineries = data.map((winery: any) => {
      const wineryDetails = wineries.find(w => w._id.toString() === winery.wineryId.toString());
      const tasting = wineryDetails?.tasting_info?.find((t: any) => t.tasting_title === winery.tastingTitle) || wineryDetails?.tasting_info?.[0];

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
        status: "confirmed" // Mark individual wineries as confirmed
      };
    });
    await booking.save();

    // 1. Send ONE Master Itinerary Email to Customer
    try {
      await sendMasterItineraryNotification(
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
            numberOfChildren: winery.numberOfChildren || 0,
            numberOfNonDrinkers: winery.numberOfNonDrinkers || 0,
            specialRequests: booking.specialRequests,
            paymentStatus: "paid"
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
    if (reservedSlots.length > 0) {
      console.warn("Rolling back reserved slots due to unexpected booking creation error...");
      for (const reserved of reservedSlots) {
        try {
          await SlotInventory.findByIdAndUpdate(reserved.slotId, {
            $inc: { bookedCapacity: -reserved.guestsReserved, availableCapacity: reserved.guestsReserved }
          });
        } catch (rollbackErr) {
          console.error("Failed to rollback slot reservation:", rollbackErr);
        }
      }
    }
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
          status: { $first: "$status" }, // This is the MASTER status
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          wineries: { $push: "$wineries" },
          payment_method: { $first: "$payment_method" },
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