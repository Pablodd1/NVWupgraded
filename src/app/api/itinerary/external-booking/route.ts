import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Booking from "@/models/booking.model";
import SlotInventory from "@/models/slotInventory.model";
import Winery from "@/models/winery.model";
import { sendBookingNotifications } from "@/lib/notifications";

/**
 * POST /api/itinerary/external-booking
 * Track external bookings (booked via winery's external link)
 * - Reduces inventory
 * - Creates booking record
 * - Sends notifications
 * - Does NOT process payment (handled externally)
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const {
            wineryId,
            tastingTitle,
            bookingDate,
            bookingTime,
            numberOfGuests,
            customerFirstName,
            customerLastName,
            customerEmail,
            customerPhone,
            specialRequests,
            externalBookingReference, // Reference from external system
        } = body;

        // Validate required fields
        if (!wineryId || !tastingTitle || !bookingDate || !bookingTime || !numberOfGuests) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!customerEmail) {
            return NextResponse.json(
                { error: "Customer email is required" },
                { status: 400 }
            );
        }

        // Get winery details
        const winery = await Winery.findById(wineryId);
        if (!winery) {
            return NextResponse.json(
                { error: "Winery not found" },
                { status: 404 }
            );
        }

        // Verify this winery supports external booking
        if (winery.payment_method?.type !== 'external_booking') {
            return NextResponse.json(
                { error: "This winery does not support external booking tracking" },
                { status: 400 }
            );
        }

        // Find the tasting info
        const tastingInfo = winery.tasting_info.find(
            (t: any) => t.tasting_title === tastingTitle
        );

        if (!tastingInfo) {
            return NextResponse.json(
                { error: "Tasting experience not found" },
                { status: 404 }
            );
        }

        // Check and update inventory
        const dateObj = new Date(bookingDate);
        const dateString = dateObj.toISOString().split('T')[0];

        let slotInventory = await SlotInventory.findOne({
            wineryId,
            tastingTitle,
            date: dateString,
            timeSlot: bookingTime,
        });

        if (!slotInventory) {
            // Create new slot inventory
            const maxCapacity = tastingInfo.booking_info?.max_guests_per_slot || 10;
            slotInventory = new SlotInventory({
                wineryId,
                tastingTitle,
                date: dateString,
                timeSlot: bookingTime,
                maxCapacity,
                currentCapacity: maxCapacity - numberOfGuests,
                bookings: [],
            });
        } else {
            // Check if enough capacity
            if (slotInventory.currentCapacity < numberOfGuests) {
                return NextResponse.json(
                    {
                        error: "Not enough capacity available",
                        available: slotInventory.currentCapacity,
                        requested: numberOfGuests,
                    },
                    { status: 400 }
                );
            }

            // Reduce capacity
            slotInventory.currentCapacity -= numberOfGuests;
        }

        // Create booking record
        const booking = await Booking.create({
            wineryId,
            tastingTitle,
            bookingDate: new Date(`${dateString}T${bookingTime}`),
            numberOfGuests,
            customerFirstName: customerFirstName || "External",
            customerLastName: customerLastName || "Customer",
            customerEmail,
            customerPhone: customerPhone || "",
            specialRequests: specialRequests || "",
            status: "confirmed", // Auto-confirm external bookings
            paymentStatus: "external", // Mark as external payment
            paymentMethod: "external_booking",
            totalAmount: 0, // No payment processed through our system
            externalBookingReference: externalBookingReference || null,
            createdAt: new Date(),
        });

        // Add booking reference to slot inventory
        slotInventory.bookings.push({
            bookingId: booking._id.toString(),
            guestCount: numberOfGuests,
        });

        await slotInventory.save();

        // Send notifications
        try {
            await sendBookingNotifications({
                bookingId: booking._id.toString(),
                customerFirstName: booking.customerFirstName,
                customerLastName: booking.customerLastName,
                customerEmail: booking.customerEmail,
                customerPhone: booking.customerPhone,
                wineryName: winery.name,
                wineryEmail: winery.contact_info?.email || "",
                wineryPhone: winery.contact_info?.phone || "",
                bookingDateTime: booking.bookingDate.toISOString(),
                numberOfGuests: booking.numberOfGuests,
                specialRequests: booking.specialRequests,
            });
        } catch (notificationError) {
            console.error("Failed to send notifications:", notificationError);
            // Don't fail the booking if notifications fail
        }

        return NextResponse.json({
            success: true,
            message: "External booking tracked successfully",
            booking: {
                id: booking._id,
                wineryName: winery.name,
                tastingTitle: booking.tastingTitle,
                bookingDate: booking.bookingDate,
                numberOfGuests: booking.numberOfGuests,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
            },
            inventory: {
                remainingCapacity: slotInventory.currentCapacity,
                maxCapacity: slotInventory.maxCapacity,
            },
        });

    } catch (error: any) {
        console.error("External booking error:", error);
        return NextResponse.json(
            {
                error: "Failed to track external booking",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/itinerary/external-booking
 * Get external booking statistics
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const wineryId = searchParams.get("wineryId");

        const query: any = {
            paymentMethod: "external_booking",
        };

        if (wineryId) {
            query.wineryId = wineryId;
        }

        const externalBookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .limit(100);

        const stats = {
            total: externalBookings.length,
            confirmed: externalBookings.filter((b: any) => b.status === "confirmed").length,
            totalGuests: externalBookings.reduce((sum: number, b: any) => sum + b.numberOfGuests, 0),
        };

        return NextResponse.json({
            success: true,
            stats,
            bookings: externalBookings,
        });

    } catch (error: any) {
        console.error("Failed to get external bookings:", error);
        return NextResponse.json(
            {
                error: "Failed to retrieve external bookings",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
