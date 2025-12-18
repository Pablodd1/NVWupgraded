import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { authenticateRequest } from "@/lib/rbac";
import User from "@/models/user.model";

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Use RBAC authentication
    const authUser = await authenticateRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch full user details from database
    const user = await User.findById(authUser.userId)
      .select("-password")
      .populate('wineryId');
      
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
