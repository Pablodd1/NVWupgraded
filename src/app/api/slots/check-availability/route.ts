import { dbConnect } from "@/lib/dbConnect";
import SlotInventory from "@/models/slotInventory.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const wineryId = searchParams.get("wineryId");
    const date = searchParams.get("date");
    const timeSlot = searchParams.get("timeSlot");
    const guests = parseInt(searchParams.get("guests") || "1");

    if (!wineryId || !date || !timeSlot) {
      return NextResponse.json(
        { message: "Missing required parameters: wineryId, date, timeSlot" },
        { status: 400 }
      );
    }

    // Find the slot
    const slot = await SlotInventory.findOne({
      wineryId,
      date,
      timeSlot,
      isBlocked: false
    });

    if (!slot) {
      return NextResponse.json({
        available: false,
        message: "No slots available for this date and time",
        availableCapacity: 0
      });
    }

    const hasCapacity = slot.availableCapacity >= guests;

    return NextResponse.json({
      available: hasCapacity,
      availableCapacity: slot.availableCapacity,
      totalCapacity: slot.totalCapacity,
      bookedCapacity: slot.bookedCapacity,
      message: hasCapacity 
        ? `Available: ${slot.availableCapacity} seats remaining`
        : `Insufficient capacity: ${slot.availableCapacity} available, ${guests} requested`
    });
  } catch (error) {
    console.error("Error checking slot availability:", error);
    return NextResponse.json(
      { error: "Server error checking availability" },
      { status: 500 }
    );
  }
}

// Get all available slots for a winery within a date range
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { wineryId, startDate, endDate } = await req.json();

    if (!wineryId) {
      return NextResponse.json(
        { message: "Missing required parameter: wineryId" },
        { status: 400 }
      );
    }

    const query: any = {
      wineryId,
      isBlocked: false,
      availableCapacity: { $gt: 0 }
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const availableSlots = await SlotInventory.find(query).sort({ date: 1, timeSlot: 1 });

    return NextResponse.json({
      slots: availableSlots,
      count: availableSlots.length
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Server error fetching slots" },
      { status: 500 }
    );
  }
}
