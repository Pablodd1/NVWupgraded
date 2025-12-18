import mongoose from "mongoose";
import Winery from "../src/models/winery.model";
import SlotInventory from "../src/models/slotInventory.model";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nvw";

// Time slots for tastings
const TIME_SLOTS = [
  "Morning (10:00 AM - 12:00 PM)",
  "Afternoon (1:00 PM - 3:00 PM)",
  "Evening (4:00 PM - 6:00 PM)"
];

// Generate dates for the next 90 days
function generateDates(daysAhead: number = 90): Date[] {
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

// Generate available slots for tasting_info.booking_info.available_slots
function generateAvailableSlots(daysAhead: number = 90): string[] {
  const slots: string[] = [];
  const dates = generateDates(daysAhead);
  
  dates.forEach(date => {
    // Morning slots
    const morning1 = new Date(date);
    morning1.setHours(10, 0, 0, 0);
    slots.push(morning1.toISOString());
    
    const morning2 = new Date(date);
    morning2.setHours(11, 30, 0, 0);
    slots.push(morning2.toISOString());
    
    // Afternoon slots
    const afternoon1 = new Date(date);
    afternoon1.setHours(13, 30, 0, 0);
    slots.push(afternoon1.toISOString());
    
    const afternoon2 = new Date(date);
    afternoon2.setHours(15, 0, 0, 0);
    slots.push(afternoon2.toISOString());
    
    // Evening slots
    const evening = new Date(date);
    evening.setHours(16, 30, 0, 0);
    slots.push(evening.toISOString());
  });
  
  return slots;
}

async function seedSlots() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing slots
    console.log("Clearing existing slots...");
    await SlotInventory.deleteMany({});
    console.log("✅ Cleared existing slots");

    // Get all wineries
    const wineries = await Winery.find({});
    console.log(`Found ${wineries.length} wineries`);

    const dates = generateDates(90); // 90 days ahead
    let totalSlots = 0;

    for (const winery of wineries) {
      console.log(`\nSeeding slots for: ${winery.name}`);
      
      // Update winery's available_slots in booking_info
      if (winery.tasting_info && winery.tasting_info.length > 0) {
        const availableSlots = generateAvailableSlots(90);
        
        for (let tastingInfo of winery.tasting_info) {
          if (tastingInfo.booking_info) {
            tastingInfo.booking_info.available_slots = availableSlots;
          }
        }
        
        await winery.save();
        console.log(`✅ Updated ${winery.name} with ${availableSlots.length} available slots`);
      }

      // Create SlotInventory records for this winery
      const slotsToCreate = [];
      
      for (const date of dates) {
        for (const timeSlot of TIME_SLOTS) {
          // Random capacity between 4-12 guests
          const capacity = Math.floor(Math.random() * 9) + 4;
          
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

      await SlotInventory.insertMany(slotsToCreate);
      totalSlots += slotsToCreate.length;
      console.log(`✅ Created ${slotsToCreate.length} slots for ${winery.name}`);
    }

    console.log(`\n✅ Seeding completed! Total slots created: ${totalSlots}`);
    console.log(`   - ${wineries.length} wineries`);
    console.log(`   - ${dates.length} days`);
    console.log(`   - ${TIME_SLOTS.length} time slots per day`);
    console.log(`   - Average capacity: 8 guests per slot`);
    
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Error seeding slots:", error);
    process.exit(1);
  }
}

// Run the seed function
seedSlots();
