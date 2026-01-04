import { dbConnect } from "@/lib/dbConnect";
import Winery from "@/models/winery.model";
import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import User from "@/models/user.model";

import { autoGenerateWinerySlots } from "@/lib/slotGenerator";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findById(userId);
    if (!user || (user.role !== "winery" && user.role !== "admin")) {
      return NextResponse.json({ message: "Forbidden: Only winery or admin users can create a winery." }, { status: 403 });
    }
    const data = await req.json();
    const winery = await Winery.create({ ...data, owner: userId });

    // Auto-generate slots for the next 30 days
    await autoGenerateWinerySlots(winery, 30);

    return NextResponse.json({ message: "sucess", winery }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

import { mockWineries } from "@/lib/mockData";


export async function GET(req: Request) {
  try {
    await dbConnect();

    // Parse query params for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "1000", 10); // Default to high limit to preserve existing behavior for now, but allow optimization
    const skip = (page - 1) * limit;

    // Use .select() to return only necessary fields for the card view
    // This drastically reduces payload size by omitting heavy fields if not needed
    const wineries = await Winery.find()
      .select("name description location tasting_info contact_info amenities images")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Winery.countDocuments();

    return NextResponse.json({
      message: "success",
      wineries,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error in GET /api/winery (Falling back to mock data):", error);
    // Fallback to mock data so the app "works" for the user
    return NextResponse.json({
      message: "fallback",
      wineries: mockWineries,
      total: mockWineries.length,
      isMock: true,
      warning: "Offline mode: Failed to connect to database."
    }, { status: 200 });
  }
}
