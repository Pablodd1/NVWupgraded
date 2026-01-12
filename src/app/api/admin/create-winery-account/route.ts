import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import Winery from "@/models/winery.model";
import { requireAdmin } from "@/lib/rbac";
import bcrypt from "bcryptjs";
import { autoGenerateWinerySlots } from "@/lib/slotGenerator";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Check admin auth - requireAdmin returns user object or error response
    const adminUser = await requireAdmin(req);
    if (adminUser instanceof NextResponse) {
      return adminUser; // Return error response
    }

    const body = await req.json();
    const {
      // User account details
      firstName,
      lastName,
      email,
      password,
      phone,

      // Winery details
      wineryName,
      wineryAddress,
      wineryLat,
      wineryLong,
      wineryPhone,
      wineryEmail,
      wineryWebsite,
      wineryDescription,
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "User details (firstName, lastName, email, password) are required" },
        { status: 400 }
      );
    }

    if (!wineryName || !wineryAddress) {
      return NextResponse.json(
        { message: "Winery details (name, address) are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create winery owner account first
    let newUser: any;
    try {
      newUser = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password, // Password will be hashed by the model pre-save hook
        phone: phone || "",
        role: "winery",
        dateOfBirth: new Date("1990-01-01"), // Default DOB
      });
    } catch (userError: any) {
      return NextResponse.json(
        { message: "Failed to create user account: " + userError.message },
        { status: 400 }
      );
    }

    // Create winery with owner reference
    let newWinery: any;
    try {
      newWinery = await Winery.create({
        name: wineryName,
        owner: newUser._id,
        location: {
          address: wineryAddress,
          latitude: wineryLat || 38.5025,
          longitude: wineryLong || -122.2654,
          is_mountain_location: false,
        },
        contact_info: {
          phone: wineryPhone || phone || "",
          email: wineryEmail || email,
          website: wineryWebsite || "",
        },
        description: wineryDescription || `Welcome to ${wineryName}!`,
        tasting_info: [{
          tasting_title: "Wine Tasting Experience",
          tasting_description: "Experience our finest wines",
          ava: "Napa Valley",
          tasting_price: 50,
          available_times: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
          wine_types: ["Cabernet Sauvignon", "Chardonnay"],
          number_of_wines_per_tasting: 5,
          special_features: [],
          images: ["https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"],
          food_pairing_options: [],
          tours: {
            available: true,
            tour_price: 25,
            tour_options: [{ description: "Cellar Tour", cost: 25 }],
          },
          wine_details: [],
          booking_info: {
            booking_enabled: true,
            max_guests_per_slot: 20,
            number_of_people: [1, 2, 4, 6],
            dynamic_pricing: {
              enabled: false,
              weekend_multiplier: 1.2,
            },
            available_slots: [],
          },
          other_features: [],
        }],
        amenities: {
          virtual_sommelier: false,
          augmented_reality_tours: false,
          handicap_accessible: true,
        },
        user_reviews: [],
        transportation: {
          uber_availability: true,
          lyft_availability: true,
          distance_from_user: 0,
        },
      });
    } catch (wineryError: any) {
      // Rollback: Delete the user we just created
      await User.findByIdAndDelete(newUser._id);
      return NextResponse.json(
        { message: "Failed to create winery (user rolled back): " + wineryError.message },
        { status: 500 }
      );
    }

    // Update user with winery ID
    try {
      newUser.wineryId = newWinery._id;
      await newUser.save();
    } catch (updateError: any) {
      // Rollback: Delete user and winery
      await User.findByIdAndDelete(newUser._id);
      await Winery.findByIdAndDelete(newWinery._id);
      return NextResponse.json(
        { message: "Failed to link user to winery (rolled back): " + updateError.message },
        { status: 500 }
      );
    }

    // Auto-generate slots for the next 30 days
    // Re-fetch the winery document to ensure we have a Mongoose-enabled object for .save()
    const wineryDoc = await Winery.findById(newWinery._id);
    if (wineryDoc) {
      await autoGenerateWinerySlots(wineryDoc, 30);
    }

    return NextResponse.json(
      {
        message: "Winery account created successfully",
        user: {
          _id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        },
        winery: {
          _id: newWinery._id,
          name: newWinery.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating winery account:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create winery account" },
      { status: 500 }
    );
  }
}
