import { dbConnect } from "@/lib/dbConnect";
import Winery from "@/models/winery.model";
import { NextResponse } from "next/server";
import { getUserIdFromToken } from "@/lib/auth";
import User from "@/models/user.model";

export async function GET(request: Request) {
  await dbConnect();

  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    let query = {};
    if (user.role === "winery") {
      query = { owner: userId };
    }
    const totalWineries = await Winery.countDocuments(query);
    const totalPages = Math.ceil(totalWineries / limit);
    const wineries = await Winery.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return NextResponse.json({
      wineries,
      totalPages,
      currentPage: page,
      totalWineries,
    });
  } catch (error) {
    console.error("Error fetching wineries:", error);
    return NextResponse.json({ error: "Failed to fetch wineries" }, { status: 500 });
  }
}
