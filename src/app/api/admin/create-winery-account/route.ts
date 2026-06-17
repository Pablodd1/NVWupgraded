export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import Winery from "@/models/winery.model";
import { requireAdmin } from "@/lib/rbac";

import { autoGenerateWinerySlots } from "@/lib/slotGenerator";
import { sendWelcomeNotification } from "@/lib/notifications";

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

    if (!phone) {
      return NextResponse.json(
        { message: "Phone number is required" },
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
        phone: phone,
        role: "winery",
        dateOfBirth: new Date("1990-01-01"), // Default DOB
        ageVerified: true, // Admin-created accounts are pre-verified
        isActive: true,
      });
    } catch (userError: any) {
      return NextResponse.json(
        { message: "Failed to create user account: " + userError.message },
        { status: 400 }
      );
    }

    // Normalize website URL (add https:// if missing)
    let normalizedWebsite = wineryWebsite || "";
    if (normalizedWebsite && !normalizedWebsite.startsWith("http://") && !normalizedWebsite.startsWith("https://")) {
      normalizedWebsite = "https://" + normalizedWebsite.replace(/^www\./, "www.");
    }

    // Create winery with owner reference
    // NOTE: tasting_info is EMPTY - winery owners must fill in their own details
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
          website: normalizedWebsite,
        },
        description: wineryDescription || "",
        // Empty tasting_info - winery owner will fill this in via their dashboard
        tasting_info: [],
        amenities: {
          virtual_sommelier: false,
          augmented_reality_tours: false,
          handicap_accessible: false,
        },
        user_reviews: [],
        transportation: {
          uber_availability: false,
          lyft_availability: false,
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
      await User.findByIdAndUpdate(newUser._id, { wineryId: newWinery._id });
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

    // 4. Send Welcome Email to the new Winery Owner
    try {
      await sendWelcomeNotification(newUser, true);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // We don't roll back here as the account is already fully functional
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
