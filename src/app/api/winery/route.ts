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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "1000", 10);
    const skip = (page - 1) * limit;

    const filtersParam = searchParams.get("filters");
    let query: any = {};

    if (filtersParam) {
      try {
        const filters = JSON.parse(filtersParam);

        // Build Dynamic Query based on filters

        // 1. Keyword search (Name or Description)
        if (filters.searchQuery) {
          query.$or = [
            { name: { $regex: filters.searchQuery, $options: "i" } },
            { description: { $regex: filters.searchQuery, $options: "i" } }
          ];
        }

        // 2. AVA Region
        if (filters.ava && filters.ava.length > 0) {
          query["tasting_info.ava"] = { $in: filters.ava };
        }

        // 3. Mountain Location
        if (filters.mountainLocation) {
          query["location.is_mountain_location"] = true;
        }

        // 4. Wine Types
        if (filters.wineType) {
          const selectedWines = Object.keys(filters.wineType).filter(w => filters.wineType[w as keyof typeof filters.wineType]);
          if (selectedWines.length > 0) {
            // Regex to match ignoring case
            const regexArr = selectedWines.map(w => new RegExp(`^${w}$`, 'i'));
            query["tasting_info.wine_types"] = { $in: regexArr };
          }
        }

        // 5. Special Features (Ex: Hand-blown glass)
        if (filters.specialFeatures && filters.specialFeatures.length > 0) {
          // If Handicapped Accessible is selected, check amenities instead of tasting_info explicitly
          const hasHandicap = filters.specialFeatures.includes("Handicap Accessible");
          const otherFeatures = filters.specialFeatures.filter((f: string) => f !== "Handicap Accessible");

          if (hasHandicap) {
            query["amenities.handicap_accessible"] = true;
          }
          if (otherFeatures.length > 0) {
            query["tasting_info.special_features"] = { $all: otherFeatures };
          }
        }

        // 6. Tasting Price Range (Check if any tasting matches to the range)
        if (filters.priceRange && filters.priceRange.length === 2 && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)) {
          query["tasting_info.tasting_price"] = { $gte: filters.priceRange[0], $lte: filters.priceRange[1] };
        } else if (filters.tastingPrice !== undefined && filters.tastingPrice < 200) { // Specific limit
          query["tasting_info.tasting_price"] = { $lte: filters.tastingPrice };
        }

        // 7. Amenities Checks
        if (filters.allowsChildren) {
          query["amenities.allows_children"] = true;
        }
        if (filters.allowsNonDrinkers) {
          query["amenities.allows_non_drinkers"] = true;
        }

        // 8. Other Booleans
        if (filters.toursAvailable) {
          query["tasting_info.tours.available"] = true;
        }
        if (filters.foodPairings) {
          // check if array has size > 0
          query["tasting_info.food_pairing_options.0"] = { $exists: true };
        }
        if (filters.multipleTastings) {
          query["tasting_info.1"] = { $exists: true };
        }

      } catch (e) {
        console.error("Error parsing filters param", e);
      }
    }

    const wineries = await Winery.find(query)
      .select("name description location tasting_info contact_info amenities images is_featured")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Winery.countDocuments(query);

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
