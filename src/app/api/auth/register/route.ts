import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import { createToken, setTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { firstName, lastName, email, phone, password, dateOfBirth, role, marketingConsent, smsConsent } = await req.json();

    console.log("📝 NEW USER REGISTRATION ATTEMPT:", {
      email,
      phone,
      firstName,
      lastName,
      role: role || "customer",
      hasDateOfBirth: !!dateOfBirth,
      marketingConsent: marketingConsent || false,
      smsConsent: smsConsent || false,
      timestamp: new Date().toISOString()
    });

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      console.warn("❌ Registration failed: Missing required fields", { email });
      return NextResponse.json(
        { error: "All fields are required: firstName, lastName, email, phone, password" },
        { status: 400 }
      );
    }

    // Age validation (must be 21+)
    let ageVerified = false;
    let actualAge = 0;

    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (actualAge < 21) {
        console.warn("❌ Registration failed: User under 21", {
          email,
          age: actualAge,
          dateOfBirth
        });
        return NextResponse.json(
          { error: "You must be 21 years or older to register" },
          { status: 400 }
        );
      }

      ageVerified = true;
      console.log("✅ Age verification passed:", { email, age: actualAge });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("❌ Registration failed: Email already exists", { email });
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      console.warn("❌ Registration failed: Phone already exists", { phone });
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
      // Age verification fields (Twilio compliance)
      ageVerified: ageVerified,
      ageVerificationDate: ageVerified ? new Date() : undefined,
      ageVerificationMethod: ageVerified ? 'dob' : undefined,
      // SMS opt-in fields (Twilio compliance)
      smsOptIn: smsConsent || false,
      smsOptInDate: smsConsent ? new Date() : undefined,
      smsOptInAgeConfirmed: (smsConsent && ageVerified) || false,
    });

    console.log("✅ USER REGISTERED SUCCESSFULLY:", {
      userId: newUser._id.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      role: newUser.role,
      age: actualAge || "not provided",
      ageVerified: newUser.ageVerified,
      marketingConsent: newUser.marketingConsent,
      smsConsent: newUser.smsConsent,
      smsOptIn: newUser.smsOptIn,
      smsOptInAgeConfirmed: newUser.smsOptInAgeConfirmed,
      timestamp: new Date().toISOString()
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
      ageVerified: newUser.ageVerified,
      smsOptIn: newUser.smsOptIn,
    };

    console.log("🎉 Registration complete, token set, user logged in:", {
      userId: newUser._id.toString(),
      email: newUser.email
    });

    return NextResponse.json({ success: true, user: userResponse }, { status: 201 });
  } catch (error: any) {
    console.error("❌ REGISTRATION ERROR:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 400 });
  }
}
