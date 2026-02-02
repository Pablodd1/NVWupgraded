import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Require admin role
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) return adminUser; // Error response
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Admin sees all bookings
    const bookings = await BookingModel.find()
      .sort({ createdAt: -1 })
      .populate({ path: "userId", model: "User", select: "name email role createdAt" })
      .populate({ path: "wineries.wineryId", model: "Winery" })
      .skip(skip)
      .limit(limit);
    const totalBookings = await BookingModel.countDocuments();

    return NextResponse.json({
      bookings,
      totalPages: Math.ceil(totalBookings / limit),
      currentPage: page,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching bookings", error: error.message || error }, { status: 500 });
  }
}
