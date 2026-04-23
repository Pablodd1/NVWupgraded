import { dbConnect } from "@/lib/dbConnect";
import BookingModel from "@/models/booking.model";
import WineryModel from "@/models/winery.model";
import { getUserIdFromToken } from "@/lib/auth";
import UserModel from "@/models/user.model";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookingId } = await params;
        const userId = await getUserIdFromToken();
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await dbConnect();

        // Verify user is Admin or the Winery Owner of the booking
        const user = await UserModel.findById(userId);
        if (!user || (user.role !== "admin" && user.role !== "winery")) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const booking = await BookingModel.findById(bookingId);
        if (!booking) return NextResponse.json({ message: "Booking not found" }, { status: 404 });

        // If winery owner, verify they own the winery in this booking
        if (user.role === "winery") {
            const wineryId = booking.wineries[0].wineryId.toString();
            const ownedWinery = await WineryModel.findOne({ _id: wineryId, owner: userId });
            if (!ownedWinery) return NextResponse.json({ message: "Forbidden: You do not own this winery" }, { status: 403 });
        }

        const updates = await request.json();
        const { wineryUpdates } = updates; // Array of updates for wineries in the booking

        if (!Array.isArray(wineryUpdates)) {
            return NextResponse.json({ message: "Invalid updates format" }, { status: 400 });
        }

        // Update the booking details
        let newTotalPrice = 0;

        for (const update of wineryUpdates) {
            const wineryBooking = booking.wineries.find(
                (w: any) => w.wineryId.toString() === update.wineryId.toString()
            );

            if (wineryBooking) {
                if (update.numberOfGuests !== undefined) wineryBooking.numberOfGuests = update.numberOfGuests;
                if (update.tours !== undefined) wineryBooking.tours = update.tours;
                if (update.foodPairings !== undefined) wineryBooking.foodPairings = update.foodPairings;
                if (update.otherFeatures !== undefined) wineryBooking.otherFeatures = update.otherFeatures;

                // Recalculate price for this winery
                const winery = await WineryModel.findById(wineryBooking.wineryId);
                if (winery) {
                    // Logic similar to booking route
                    const tasting = winery.tasting_info[0];
                    const guests = wineryBooking.numberOfGuests || 1;
                    const tastingPrice = Number(tasting.tasting_price) || 0;

                    let wineryTotal = tastingPrice * guests;

                    // Add features (Per Person)
                    wineryBooking.foodPairings?.forEach((fp: any) => wineryTotal += (Number(fp.price) || 0) * guests);
                    wineryBooking.tours?.forEach((t: any) => wineryTotal += (Number(t.price) || 0) * guests);
                    wineryBooking.otherFeatures?.forEach((of: any) => wineryTotal += (Number(of.price) || 0) * guests);

                    newTotalPrice += wineryTotal;
                }
            }
        }

        booking.totalPrice = newTotalPrice;
        booking.totalAmount = newTotalPrice; // Sync both fields
        await booking.save();

        return NextResponse.json({
            message: "Booking modified successfully",
            booking: booking.toJSON()
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error modifying booking:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
