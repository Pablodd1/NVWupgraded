import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { requireWinery } from "@/lib/rbac";
import Winery from "@/models/winery.model";
import User from "@/models/user.model";

// GET winery profile
export async function GET(request: Request) {
  try {
    await dbConnect();

    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user; // Error response

    // Get winery for this user
    const winery = await Winery.findOne({ owner: user.userId });

    if (!winery) {
      return NextResponse.json(
        { error: "No winery found for this account" },
        { status: 404 }
      );
    }

    return NextResponse.json({ winery }, { status: 200 });
  } catch (error: any) {
    console.error("Get winery profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update winery profile
export async function PUT(request: Request) {
  try {
    await dbConnect();

    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user; // Error response

    const updates = await request.json();

    // Find winery owned by this user
    const winery = await Winery.findOne({ owner: user.userId });

    if (!winery) {
      return NextResponse.json(
        { error: "No winery found for this account" },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'name',
      'description',
      'location',
      'contact_info',
      'tasting_info',
      'amenities',
      'transportation',
      'payment_method',
      'other_features'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        winery[field] = updates[field];
      }
    });

    await winery.save();

    return NextResponse.json({
      success: true,
      message: "Winery profile updated successfully",
      winery
    }, { status: 200 });
  } catch (error: any) {
    console.error("Update winery profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
// POST create new winery profile
export async function POST(request: Request) {
  try {
    await dbConnect();

    const user = await requireWinery(request);
    if (user instanceof NextResponse) return user; // Error response

    // Check if winery already exists
    const existingWinery = await Winery.findOne({ owner: user.userId });
    if (existingWinery) {
      return NextResponse.json(
        { error: "Winery profile already exists. Use PUT to update." },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Create new winery
    const newWinery = await Winery.create({
      ...body,
      owner: user.userId,
      // Ensure required fields have defaults if missing
      tasting_info: body.tasting_info || [],
      amenities: body.amenities || {},
      transportation: body.transportation || {}
    });

    // Update user to link wineryId
    await User.findByIdAndUpdate(user.userId, { wineryId: newWinery._id });

    return NextResponse.json({
      success: true,
      message: "Winery created successfully",
      winery: newWinery
    }, { status: 201 });

  } catch (error: any) {
    console.error("Create winery profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
