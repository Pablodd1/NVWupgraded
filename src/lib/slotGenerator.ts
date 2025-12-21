import SlotInventory from "@/models/slotInventory.model";

// Time slots for tastings
const TIME_SLOTS = [
    "Morning (10:00 AM - 12:00 PM)",
    "Afternoon (1:00 PM - 3:00 PM)",
    "Evening (4:00 PM - 6:00 PM)"
];

/**
 * Generates dates for a specified number of days ahead
 */
function generateDates(daysAhead: number = 30): Date[] {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysAhead; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }

    return dates;
}

/**
 * Generates ISO string available slots for the winery model
 */
function generateAvailableSlotsStrings(daysAhead: number = 30): string[] {
    const slots: string[] = [];
    const dates = generateDates(daysAhead);

    dates.forEach(date => {
        // Standard times for each day
        const times = [
            { h: 10, m: 0 },
            { h: 11, m: 30 },
            { h: 13, m: 30 },
            { h: 15, m: 0 },
            { h: 16, m: 30 }
        ];

        times.forEach(t => {
            const slotDate = new Date(date);
            slotDate.setHours(t.h, t.m, 0, 0);
            slots.push(slotDate.toISOString());
        });
    });

    return slots;
}

/**
 * Automatically generates slots for a new winery or updates an existing one
 * @param winery The winery document (Mongoose document)
 * @param daysAhead How many days of slots to generate (default 30)
 */
export async function autoGenerateWinerySlots(winery: any, daysAhead: number = 30) {
    try {
        console.log(`Auto-generating slots for winery: ${winery.name}`);

        // 1. Update the winery document's available_slots array
        if (winery.tasting_info && winery.tasting_info.length > 0) {
            const availableSlotsStrings = generateAvailableSlotsStrings(daysAhead);

            // Handle both single tasting_info and array of tasting_info if schema varies
            const tastingInfos = Array.isArray(winery.tasting_info) ? winery.tasting_info : [winery.tasting_info];

            for (let tastingInfo of tastingInfos) {
                if (!tastingInfo.booking_info) {
                    tastingInfo.booking_info = { booking_enabled: true };
                }
                tastingInfo.booking_info.available_slots = availableSlotsStrings;
            }

            // Save the winery update
            await winery.save();
        }

        // 2. Create the SlotInventory records
        const dates = generateDates(daysAhead);
        const slotsToCreate = [];

        // Check if slots already exist to avoid duplicates if this is an update
        const existingCount = await SlotInventory.countDocuments({ wineryId: winery._id });
        if (existingCount > 0) {
            console.log(`Slots already exist for ${winery.name}. Skipping SlotInventory creation to avoid duplicates.`);
            return;
        }

        for (const date of dates) {
            for (const timeSlot of TIME_SLOTS) {
                // Standard capacity of 10 guests for new wineries
                const capacity = 10;

                slotsToCreate.push({
                    wineryId: winery._id,
                    date: date,
                    timeSlot: timeSlot,
                    totalCapacity: capacity,
                    bookedCapacity: 0,
                    availableCapacity: capacity,
                    status: 'available',
                    bookings: []
                });
            }
        }

        if (slotsToCreate.length > 0) {
            await SlotInventory.insertMany(slotsToCreate);
            console.log(`✅ Successfully generated ${slotsToCreate.length} slots for ${winery.name}`);
        }

    } catch (error) {
        console.error(`Error in autoGenerateWinerySlots for ${winery.name}:`, error);
        // Don't throw, we don't want to break the winery creation if slot generation fails
    }
}
