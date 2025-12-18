import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireWinery } from "@/lib/rbac";
import BookingModel from "@/models/booking.model";
import Winery from "@/models/winery.model";

// GET bookings for winery
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user;
    
    // Get winery for this user
    const winery = await Winery.findOne({ owner: user.userId });
    if (!winery) {
      return NextResponse.json({ error: "No winery found" }, { status: 404 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Find all bookings that include this winery
    const query: any = {
      'wineries.wineryId': winery._id
    };
    
    if (status) {
      query.status = status;
    }
    
    let bookings = await BookingModel.find(query)
      .populate('userId', '-password')
      .populate('wineries.wineryId')
      .sort({ createdAt: -1 });
    
    // Filter to only show bookings for this winery
    bookings = bookings.map((booking: any) => {
      const bookingObj = booking.toObject();
      bookingObj.wineries = bookingObj.wineries.filter(
        (w: any) => w.wineryId._id.toString() === winery._id.toString()
      );
      return bookingObj;
    });
    
    // Filter by date range if provided
    if (startDate && endDate) {
      bookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.wineries[0]?.datetime);
        return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
      });
    }
    
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    console.error("Get bookings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
