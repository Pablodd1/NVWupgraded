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
/**
 * Generates ISO string available slots for the winery model based on operating hours
 */
function generateAvailableSlotsStrings(winery: any, daysAhead: number = 30): string[] {
    const slots: string[] = [];
    const dates = generateDates(daysAhead);
    const operatingHours = winery.operating_hours || {};

    dates.forEach(date => {
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof typeof operatingHours;
        const hours = operatingHours[dayOfWeek];

        if (hours && !hours.closed) {
            // Generate standard times within open/close window
            // For now, we'll generate every 1.5 hours between open and close
            try {
                const [openTime, openPeriod] = hours.open.split(' ');
                const [closeTime, closePeriod] = hours.close.split(' ');
                
                let [openH, openM] = openTime.split(':').map(Number);
                let [closeH, closeM] = closeTime.split(':').map(Number);

                if (openPeriod === 'PM' && openH !== 12) openH += 12;
                if (openPeriod === 'AM' && openH === 12) openH = 0;
                if (closePeriod === 'PM' && closeH !== 12) closeH += 12;
                if (closePeriod === 'AM' && closeH === 12) closeH = 0;

                const start = new Date(date);
                start.setHours(openH, openM, 0, 0);

                const end = new Date(date);
                end.setHours(closeH, closeM, 0, 0);

                let current = new Date(start);
                // Add slots every 90 minutes while before end time
                while (current < end) {
                    slots.push(current.toISOString());
                    current.setMinutes(current.getMinutes() + 90);
                }
            } catch (e) {
                // Fallback to default if parsing fails
                [10, 11.5, 13.5, 15, 16.5].forEach(h => {
                    const slotDate = new Date(date);
                    slotDate.setHours(Math.floor(h), (h % 1) * 60, 0, 0);
                    slots.push(slotDate.toISOString());
                });
            }
        }
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
        const availableSlotsStrings = generateAvailableSlotsStrings(winery, daysAhead);
        
        if (winery.tasting_info && winery.tasting_info.length > 0) {
            const tastingInfos = Array.isArray(winery.tasting_info) ? winery.tasting_info : [winery.tasting_info];

            for (let tastingInfo of tastingInfos) {
                if (!tastingInfo.booking_info) {
                    tastingInfo.booking_info = { booking_enabled: true };
                }
                tastingInfo.booking_info.available_slots = availableSlotsStrings;
            }
        }

        // Save the winery update
        await winery.save();

        // 2. Create the SlotInventory records
        const dates = generateDates(daysAhead);
        const slotsToCreate = [];

        // Check if slots already exist to avoid duplicates if this is an update
        const existingCount = await SlotInventory.countDocuments({ wineryId: winery._id });
        if (existingCount > 0) {
            console.log(`Slots already exist for ${winery.name}. Updating SlotInventory is not implemented here yet.`);
            return;
        }

        const operatingHours = winery.operating_hours || {};

        for (const date of dates) {
            const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof typeof operatingHours;
            const hours = operatingHours[dayOfWeek];

            if (hours && !hours.closed) {
                // For SlotInventory, we use the TIME_SLOTS labels but only if they fall within operating hours
                // Or we can generate custom labels based on the slots generated above
                // To keep it simple and consistent with the UI, we'll generate labels like "HH:MM AM"
                
                const daySlots = availableSlotsStrings.filter(s => s.startsWith(date.toISOString().split('T')[0]));
                
                for (const slotIso of daySlots) {
                    const slotDate = new Date(slotIso);
                    const timeLabel = slotDate.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                    });

                    // Standard capacity of 10 guests for new wineries
                    const capacity = 10;

                    slotsToCreate.push({
                        wineryId: winery._id,
                        date: date,
                        timeSlot: timeLabel,
                        totalCapacity: capacity,
                        bookedCapacity: 0,
                        availableCapacity: capacity,
                        status: 'available',
                        bookings: []
                    });
                }
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
