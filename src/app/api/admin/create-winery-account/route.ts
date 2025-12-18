import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import Winery from "@/models/winery.model";
import { requireAdmin } from "@/lib/rbac";
import bcrypt from "bcrypt";

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

    // Create winery first
    const newWinery = await Winery.create({
      name: wineryName,
      location: {
        address: wineryAddress,
        lat: wineryLat || 38.5025,
        long: wineryLong || -122.2654,
      },
      contact_info: {
        phone: wineryPhone || phone || "",
        email: wineryEmail || email,
        website: wineryWebsite || "",
      },
      description: wineryDescription || `Welcome to ${wineryName}!`,
      tasting_info: {
        tasting_title: "Wine Tasting Experience",
        description: "Experience our finest wines",
        ava: "Napa Valley",
        tasting_price: 50,
        available_times: ["Morning", "Afternoon"],
        wine_types: ["Red"],
        number_of_wines_per_tasting: 5,
        special_features: [],
        images: [],
        food_pairing_options: [],
        tours: {
          availability: true,
          price: 100,
          tour_options: [],
        },
        wine_details: [],
        booking_info: {
          enabled: true,
          max_guests_per_slot: 20,
          dynamic_pricing: {
            enabled: false,
            weekend_multiplier: 1.2,
          },
          slots: [],
        },
        other_features: [],
      },
      amenities: {
        virtual_sommelier: false,
        ar_wine_tours: false,
        handicap_accessible: true,
      },
      user_reviews: [],
      transportation: {
        options: [],
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create winery owner account
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: "winery",
      wineryId: newWinery._id,
      dateOfBirth: new Date("1990-01-01"), // Default DOB
    });

    // Update winery with owner reference
    await Winery.findByIdAndUpdate(newWinery._id, {
      owner: newUser._id,
    });

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
