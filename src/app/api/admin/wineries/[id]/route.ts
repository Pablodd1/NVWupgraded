export const dynamic = "force-dynamic";
import { dbConnect } from "@/lib/dbConnect";
import Winery from "@/models/winery.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

import { requireWineryOrAdmin, ownsWinery } from "@/lib/rbac";
import { sendWineryApprovalNotification } from "@/lib/notifications";
import { autoGenerateWinerySlots } from "@/lib/slotGenerator";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();

  try {
    // Require winery owner or admin role
    const user = await requireWineryOrAdmin(request);
    if (user instanceof NextResponse) return user; // Error response

    const { id } = await params;
    const winery = await Winery.findById(id);
    if (!winery) {
      return NextResponse.json({ error: "Winery not found" }, { status: 404 });
    }

    // Check ownership (admin can delete any, winery owner can only delete their own)
    if (!ownsWinery(user, id)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to delete this winery." }, { status: 403 });
    }
    const deletedWinery = await Winery.findByIdAndDelete(id);
    return NextResponse.json({
      message: "Winery deleted successfully",
      deletedWinery,
    });
  } catch (error) {
    console.error("Error deleting winery:", error);
    return NextResponse.json({ error: "Failed to delete winery" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  try {
    // Require winery owner or admin role
    const user = await requireWineryOrAdmin(request);
    if (user instanceof NextResponse) return user; // Error response

    const { id } = await params;
    const winery = await Winery.findById(id);
    if (!winery) {
      return NextResponse.json({ error: "Winery not found" }, { status: 404 });
    }

    // Check ownership
    if (!ownsWinery(user, id)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to update this winery." }, { status: 403 });
    }
    
    const data = await request.json();
    const oldStatus = winery.status;
    const updatedWinery = await Winery.findByIdAndUpdate(id, data, { new: true });

    // Regenerate slots based on updated operating hours/tasting info
    await autoGenerateWinerySlots(updatedWinery, 30);
    
    // Regenerate slots based on the updated info
    await autoGenerateWinerySlots(updatedWinery, 30);
    
    // Trigger approval notification if status changed to approved
    if (oldStatus !== 'approved' && updatedWinery.status === 'approved') {
        const owner = await User.findById(updatedWinery.owner);
        if (owner && owner.email) {
            await sendWineryApprovalNotification(updatedWinery, owner);
        }
    }

    return NextResponse.json({ message: "Winery updated successfully", updatedWinery });
  } catch (error) {
    console.error("Error updating winery:", error);
    return NextResponse.json({ error: "Failed to update winery" }, { status: 500 });
  }
}
