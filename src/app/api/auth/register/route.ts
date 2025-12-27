import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import { createToken, setTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { firstName, lastName, email, phone, password, dateOfBirth, role, marketingConsent, smsConsent } = await req.json();

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "All fields are required: firstName, lastName, email, phone, password" },
        { status: 400 }
      );
    }

    // Age validation (must be 21+)
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 21) {
        return NextResponse.json(
          { error: "You must be 21 years or older to register" },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
    }

    // Create new user (default role is "customer" unless specified)
    const userRole = role || "customer";

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      role: userRole,
      isActive: true,
      marketingConsent: marketingConsent || false,
      smsConsent: smsConsent || false,
    });

    // Create JWT token with user info
    const token = createToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      wineryId: newUser.wineryId?.toString(),
    });

    await setTokenCookie(token);

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      dateOfBirth: newUser.dateOfBirth,
      role: newUser.role,
      isActive: newUser.isActive,
      marketingConsent: newUser.marketingConsent,
      smsConsent: newUser.smsConsent,
    };

    return NextResponse.json({ success: true, user: userResponse }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 });
  }
}
