import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import User from "@/models/user.model";

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    await dbConnect();

    let bookingQuery = {};
    if (user.role === "winery") {
      // Only bookings for this user's winery
      const wineries = await (await import("@/models/winery.model")).default.find({ owner: userId }).select("_id");
      const wineryIds = wineries.map((w: any) => w._id);
      bookingQuery = { "wineries.wineryId": { $in: wineryIds } };
    }

    const bookings = await BookingModel.find(bookingQuery)
      .sort({ createdAt: -1 })
      .populate({ path: "userId", model: "User", select: "name email role createdAt" })
      .populate({ path: "wineries.wineryId", model: "Winery" })
      .skip(skip)
      .limit(limit);
    const totalBookings = await BookingModel.countDocuments(bookingQuery);

    return NextResponse.json({
      bookings,
      totalPages: Math.ceil(totalBookings / limit),
      currentPage: page,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching bookings", error: error.message || error }, { status: 500 });
  }
}
