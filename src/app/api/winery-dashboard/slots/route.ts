import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireWinery } from "@/lib/rbac";
import SlotInventory from "@/models/slotInventory.model";
import Winery from "@/models/winery.model";

// GET slots for winery
export async function GET(request: Request) {
  try {
    await dbConnect();

    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user;

    // Get winery ID for this user
    const winery = await Winery.findOne({ owner: user.userId });
    if (!winery) {
      return NextResponse.json({ error: "No winery found" }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = { wineryId: winery._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const slots = await SlotInventory.find(query)
      .sort({ date: 1, timeSlot: 1 })
      .populate('bookings');

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error: any) {
    console.error("Get slots error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new slots
export async function POST(request: Request) {
  try {
    await dbConnect();

    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user;

    // Get winery ID
    const winery = await Winery.findOne({ owner: user.userId });
    if (!winery) {
      return NextResponse.json({ error: "No winery found" }, { status: 404 });
    }

    const { date, timeSlot, totalCapacity } = await request.json();

    // Validation
    if (!date || !timeSlot || !totalCapacity) {
      return NextResponse.json(
        { error: "date, timeSlot, and totalCapacity are required" },
        { status: 400 }
      );
    }

    // Check if slot already exists
    const existing = await SlotInventory.findOne({
      wineryId: winery._id,
      date: new Date(date),
      timeSlot
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slot already exists for this date and time" },
        { status: 400 }
      );
    }

    // Create new slot
    const slot = await SlotInventory.create({
      wineryId: winery._id,
      date: new Date(date),
      timeSlot,
      totalCapacity,
      bookedCapacity: 0,
      availableCapacity: totalCapacity,
      status: 'available',
      bookings: []
    });

    return NextResponse.json({
      success: true,
      message: "Slot created successfully",
      slot
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create slot error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update slot
export async function PUT(request: Request) {
  try {
    await dbConnect();

    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user;

    const winery = await Winery.findOne({ owner: user.userId });
    if (!winery) {
      return NextResponse.json({ error: "No winery found" }, { status: 404 });
    }

    const { slotId, totalCapacity, status } = await request.json();

    if (!slotId) {
      return NextResponse.json({ error: "slotId is required" }, { status: 400 });
    }

    // Find slot and verify ownership
    const slot = await SlotInventory.findOne({
      _id: slotId,
      wineryId: winery._id
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Update capacity if provided
    if (totalCapacity !== undefined) {
      if (totalCapacity < slot.bookedCapacity) {
        return NextResponse.json(
          { error: `Cannot reduce capacity below booked amount (${slot.bookedCapacity})` },
          { status: 400 }
        );
      }
      slot.totalCapacity = totalCapacity;
    }

    // Update status if provided
    if (status !== undefined) {
      if (status === 'blocked') {
        slot.status = 'blocked';
      } else {
        // Status will be auto-calculated by pre-save hook
        slot.status = status;
      }
    }

    await slot.save();

    return NextResponse.json({
      success: true,
      message: "Slot updated successfully",
      slot
    }, { status: 200 });
  } catch (error: any) {
    console.error("Update slot error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

