import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import SlotInventory from "@/models/slotInventory.model";
import Winery from "@/models/winery.model";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Get current date/time
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    // Get date 30 days from now for "near future" slots
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    // Find winery
    const winery = await Winery.findById(id);
    if (!winery) {
      return NextResponse.json({ error: "Winery not found" }, { status: 404 });
    }
    
    // Get available slots for the next 30 days
    const availableSlots = await SlotInventory.find({
      wineryId: id,
      date: { 
        $gte: now,
        $lte: thirtyDaysFromNow
      },
      status: 'available',
      availableCapacity: { $gt: 0 }
    })
    .sort({ date: 1, timeSlot: 1 })
    .limit(50) // Limit to 50 nearest slots
    .lean();
    
    // Group slots by date
    const slotsByDate = new Map<string, any[]>();
    
    availableSlots.forEach(slot => {
      const dateKey = new Date(slot.date).toISOString().split('T')[0];
      if (!slotsByDate.has(dateKey)) {
        slotsByDate.set(dateKey, []);
      }
      slotsByDate.get(dateKey)!.push({
        timeSlot: slot.timeSlot,
        availableCapacity: slot.availableCapacity,
        totalCapacity: slot.totalCapacity,
        slotId: slot._id
      });
    });
    
    // Get today's slots
    const todayStr = now.toISOString().split('T')[0];
    const todaySlots = slotsByDate.get(todayStr) || [];
    
    // Get this week's availability (next 7 days)
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    
    const thisWeekSlots = availableSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate >= now && slotDate <= sevenDaysFromNow;
    });
    
    // Get next month's availability (8-30 days)
    const nextMonthSlots = availableSlots.filter(slot => {
      const slotDate = new Date(slot.date);
      const eightDaysFromNow = new Date(now);
      eightDaysFromNow.setDate(now.getDate() + 8);
      return slotDate >= eightDaysFromNow && slotDate <= thirtyDaysFromNow;
    });
    
    // Get earliest available slot (first slot with capacity)
    const earliestSlot = availableSlots.length > 0 ? availableSlots[0] : null;
    
    // Calculate statistics
    const totalSlotsAvailable = availableSlots.length;
    const totalCapacity = availableSlots.reduce((sum, slot) => sum + slot.availableCapacity, 0);
    const datesWithAvailability = Array.from(slotsByDate.keys()).map(dateStr => {
      const date = new Date(dateStr);
      return {
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        day: date.getDate(),
        slotsAvailable: slotsByDate.get(dateStr)!.length,
        totalCapacity: slotsByDate.get(dateStr)!.reduce((sum, s) => sum + s.availableCapacity, 0)
      };
    });
    
    // Get next 7 days summary
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      next7Days.push({
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfWeekLong: date.toLocaleDateString('en-US', { weekday: 'long' }),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        day: date.getDate(),
        isToday: i === 0,
        slots: slotsByDate.get(dateStr) || [],
        slotsAvailable: slotsByDate.get(dateStr)?.length || 0,
        totalCapacity: slotsByDate.get(dateStr)?.reduce((sum, s) => sum + s.availableCapacity, 0) || 0
      });
    }
    
    return NextResponse.json({
      success: true,
      currentDate: now.toISOString(),
      winery: {
        id: winery._id,
        name: winery.name
      },
      summary: {
        totalSlotsAvailable,
        totalCapacity,
        thisWeekSlots: thisWeekSlots.length,
        nextMonthSlots: nextMonthSlots.length,
        datesWithAvailability: datesWithAvailability.length
      },
      today: {
        date: todayStr,
        slots: todaySlots,
        slotsAvailable: todaySlots.length
      },
      next7Days,
      earliestAvailable: earliestSlot ? {
        date: earliestSlot.date,
        timeSlot: earliestSlot.timeSlot,
        availableCapacity: earliestSlot.availableCapacity,
        slotId: earliestSlot._id
      } : null,
      upcomingDates: datesWithAvailability.slice(0, 10) // Next 10 dates with availability
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Get available slots error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch available slots",
      details: error.message 
    }, { status: 500 });
  }
}
