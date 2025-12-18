import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import { createToken, setTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const user = await User.findOne({ email }).populate('wineryId');

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated. Please contact support." }, { status: 403 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
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
    console.error("Login error (Checking Demo Mode):", error);

    // DEMO MODE FALLBACK: Allow login even if DB is offline
    const demoCreds = [
      { email: "admin@napawineries.com", pass: "admin123", role: "admin", name: "System Admin" },
      { email: "owner@napawineries.com", pass: "owner123", role: "winery", name: "Winery Owner", wineryId: "657999acac9c9c0012345671" },
      { email: "customer@example.com", pass: "customer123", role: "customer", name: "John Customer" }
    ];

    try {
      const { email, password } = await (req.clone()).json();
      const demoUser = demoCreds.find(u => u.email === email && u.pass === password);

      if (demoUser) {
        console.log("🚀 Demo Mode Login Successful for:", email);
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
      console.error("Demo check failed:", innerError);
    }

    return NextResponse.json({ error: "Database offline and invalid demo credentials." }, { status: 400 });
  }
}
