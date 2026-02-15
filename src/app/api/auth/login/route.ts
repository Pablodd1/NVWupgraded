import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import Winery from "@/models/winery.model"; // Ensure model is registered for populate
import { createToken, setTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
  let email: string = "";
  let password: string = "";
  try {
    await dbConnect();
    const body = await req.json();
    email = body.email;
    password = body.password;

    console.log("🔐 LOGIN ATTEMPT:", {
      email,
      timestamp: new Date().toISOString()
    });

    const user = await User.findOne({ email }).populate('wineryId');

    if (!user) {
      console.warn("❌ Login failed: User not found", { email });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Check if account is active
    if (!user.isActive) {
      console.warn("❌ Login failed: Account deactivated", {
        email,
        userId: user._id.toString()
      });
      return NextResponse.json({ error: "Account is deactivated. Please contact support." }, { status: 403 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn("❌ Login failed: Invalid password", { email });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Create token with full user information
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      wineryId: user.wineryId?.toString(),
    });

    await setTokenCookie(token);

    console.log("✅ LOGIN SUCCESSFUL:", {
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      wineryId: user.wineryId?.toString() || "none",
      ageVerified: user.ageVerified || false,
      smsOptIn: user.smsOptIn || false,
      timestamp: new Date().toISOString()
    });

    // Return sanitized user object
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      wineryId: user.wineryId,
      isActive: user.isActive,
    };

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: userResponse
    });
  } catch (error: any) {
    console.error("❌ LOGIN ERROR (Checking Demo Mode):", {
      error: error.message,
      timestamp: new Date().toISOString()
    });

    // DEMO MODE FALLBACK: Allow login even if DB is offline
    // NOTE: These credentials MUST match the actual database users
    // Passwords are hashed in DB but plaintext here for demo fallback
    const demoCreds = [
      { email: "admin@napawineries.com", pass: "admin123", role: "admin", name: "System Admin" },
      { email: "owner@napawineries.com", pass: "owner123", role: "winery", name: "Winery Owner", wineryId: "657999acac9c9c0012345671" },
      { email: "customer@test.com", pass: "customer123", role: "customer", name: "Test Customer" },
      { email: "customer@example.com", pass: "customer123", role: "customer", name: "Example Customer" }
    ];

    try {
      // Use the already parsed credentials
      const demoUser = demoCreds.find(u => u.email === email && u.pass === password);

      if (demoUser) {
        console.log("⚠️ DEMO MODE LOGIN:", {
          email: demoUser.email,
          role: demoUser.role,
          timestamp: new Date().toISOString()
        });

        const token = createToken({
          userId: "demo_" + demoUser.role,
          email: demoUser.email,
          role: demoUser.role as any,
          firstName: demoUser.name.split(' ')[0],
          lastName: demoUser.name.split(' ')[1] || "",
          wineryId: demoUser.wineryId,
        });

        await setTokenCookie(token);

        return NextResponse.json({
          success: true,
          message: "Login successful (Demo Mode)",
          user: {
            _id: "demo_" + demoUser.role,
            firstName: demoUser.name.split(' ')[0],
            lastName: demoUser.name.split(' ')[1],
            email: demoUser.email,
            role: demoUser.role,
            wineryId: demoUser.wineryId,
            isActive: true,
          }
        });
      }
    } catch (innerError) {
      console.error("❌ Demo check failed:", innerError);
    }

    console.error("❌ Login failed: Database offline and invalid demo credentials");
    return NextResponse.json({
      error: "Login failed. Database may be offline or credentials are invalid.",
      hint: "Try demo credentials: admin@napawineries.com/admin123, owner@napawineries.com/owner123, or customer@test.com/customer123"
    }, { status: 400 });
  }
}
