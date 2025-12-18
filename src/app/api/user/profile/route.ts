import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/user.model";
import { getUserIdFromToken } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { dateOfBirth } = await req.json();

    if (!dateOfBirth) {
      return NextResponse.json({ error: "Date of birth is required" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { dateOfBirth: new Date(dateOfBirth) },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Date of birth updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error("Error updating date of birth:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
