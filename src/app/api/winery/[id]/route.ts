import { dbConnect } from "@/lib/dbConnect";
import Winery from "@/models/winery.model";
import { NextResponse } from "next/server";

import { mockWineries } from "@/lib/mockData";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const winery = await Winery.findOne({ _id: id }).lean();

    if (!winery) {
      // Check if it exists in mock data
      const mockWinery = mockWineries.find(w => w._id === id);
      if (mockWinery) {
        return NextResponse.json({ message: "fallback", winery: mockWinery, isMock: true }, { status: 200 });
      }
      return NextResponse.json({ message: "Winery not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "sucess", winery }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in GET /api/winery/${id} (Falling back to mock data):`, error);

    // Fallback to mock data if DB fails
    const mockWinery = mockWineries.find(w => w._id === id);
    if (mockWinery) {
      return NextResponse.json({
        message: "fallback",
        winery: mockWinery,
        isMock: true,
        warning: "Offline mode: Failed to connect to database."
      }, { status: 200 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
