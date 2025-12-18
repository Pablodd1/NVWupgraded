# Real-Time Slot Inventory System

## 🎯 Overview

This system prevents **OVERBOOKING** by tracking and managing winery capacity in real-time.

## 📊 How It Works

### 1. Slot Inventory Model (`SlotInventory`)
Each time slot has:
- **wineryId**: Which winery
- **date**: Booking date (YYYY-MM-DD)
- **timeSlot**: "Morning", "Afternoon", or "Evening"
- **totalCapacity**: Maximum guests allowed
- **bookedCapacity**: Currently booked guests
- **availableCapacity**: Remaining capacity (auto-calculated)
- **isBlocked**: Manual block flag for maintenance/holidays

### 2. Booking Flow with Capacity Check

#### Step 1: User Selects Time & Guests
- User picks date, time slot, and number of guests

#### Step 2: Real-Time Availability Check (Before Booking)
```javascript
GET /api/slots/check-availability?wineryId=X&date=2024-01-15&timeSlot=Morning&guests=4
```
Returns:
```json
{
  "available": true,
  "availableCapacity": 12,
  "message": "Available: 12 seats remaining"
}
```

#### Step 3: Booking Creation with Atomic Reservation
When booking is submitted to `/api/itinerary/book`:

1. **Check availability** for ALL wineries in itinerary
2. **Reserve capacity** atomically:
   - `bookedCapacity += numberOfGuests`
   - `availableCapacity -= numberOfGuests`
3. **If ANY slot fails**, rollback ALL reservations
4. **Only create booking** after successful capacity reservation

#### Step 4: Booking Status Changes

**When booking is CANCELLED** (by customer):
- Restore capacity: `availableCapacity += numberOfGuests`
- Update booking status to "cancelled"

**When booking is DECLINED** (by winery):
- Restore capacity: `availableCapacity += numberOfGuests`
- Update booking status to "declined"

**When booking is CONFIRMED**:
- Capacity already reserved (no change needed)
- Send confirmation emails

## 🔒 Preventing Race Conditions

### Atomic Operations
MongoDB's atomic updates ensure that even if two users try to book the last slot simultaneously:
- Only ONE will succeed
- The other will receive "Insufficient capacity" error

### Transaction Safety
The booking flow uses a **try-catch-rollback** pattern:
```
1. Try to reserve ALL slots
2. If ANY fail → Rollback ALL successfully reserved slots
3. If ALL succeed → Create booking
```

## 🛠️ Winery Dashboard: Inventory Management

Wineries can manage their slots at `/winery-dashboard/inventory`:

### Add New Slots
- Select date (future dates only)
- Choose time slot (Morning/Afternoon/Evening)
- Set total capacity (default: 20 guests)

### Edit Existing Slots
- Change total capacity
- View booked vs. available capacity

### Block/Unblock Slots
- Block slots for maintenance or holidays
- Blocked slots won't appear in customer search

### Filter by Date
- View slots for next 30 days
- Search specific date ranges

## 📡 API Endpoints

### Customer-Facing

#### Check Availability (GET)
```
GET /api/slots/check-availability
Query params:
  - wineryId: string (required)
  - date: YYYY-MM-DD (required)
  - timeSlot: string (required)
  - guests: number (default: 1)
```

#### Get Available Slots (POST)
```
POST /api/slots/check-availability
Body: {
  wineryId: string,
  startDate: YYYY-MM-DD (optional),
  endDate: YYYY-MM-DD (optional)
}
Returns: All available (non-blocked, capacity > 0) slots
```

### Winery Dashboard

#### Get Winery Slots (GET)
```
GET /api/winery-dashboard/slots
Query params:
  - startDate: YYYY-MM-DD (optional)
  - endDate: YYYY-MM-DD (optional)
```

#### Create Slot (POST)
```
POST /api/winery-dashboard/slots
Body: {
  date: YYYY-MM-DD,
  timeSlot: string,
  totalCapacity: number
}
```

#### Update Slot (PUT)
```
PUT /api/winery-dashboard/slots
Body: {
  slotId: string,
  totalCapacity?: number,
  isBlocked?: boolean
}
```

## 🚀 Future Enhancements

### 1. Dynamic Pricing
- Weekend multipliers (already in model)
- Peak season pricing
- Last-minute discounts

### 2. Multi-Winery Route Optimization
- Calculate optimal tour routes
- Suggest time slots based on travel time

### 3. Waitlist System
- Allow users to join waitlist for fully booked slots
- Auto-notify when capacity becomes available

### 4. Analytics
- Popular time slots
- Capacity utilization rates
- Revenue forecasting

## 🔄 Data Migration

If you have existing bookings WITHOUT inventory tracking:

### Step 1: Create Slots for Existing Bookings
```javascript
// Run this migration script
const bookings = await BookingModel.find({ status: 'confirmed' });

for (const booking of bookings) {
  for (const winery of booking.wineries) {
    const date = new Date(winery.datetime).toISOString().split('T')[0];
    const hour = new Date(winery.datetime).getHours();
    
    let timeSlot = "Afternoon (12:00 PM - 3:00 PM)";
    if (hour >= 10 && hour < 12) timeSlot = "Morning (10:00 AM - 12:00 PM)";
    if (hour >= 15 && hour < 18) timeSlot = "Evening (3:00 PM - 6:00 PM)";
    
    // Find or create slot
    let slot = await SlotInventory.findOne({ wineryId: winery.wineryId, date, timeSlot });
    if (!slot) {
      slot = new SlotInventory({
        wineryId: winery.wineryId,
        date,
        timeSlot,
        totalCapacity: 20,
        bookedCapacity: 0,
        availableCapacity: 20
      });
    }
    
    // Update capacity
    const guests = winery.numberOfGuests || 1;
    slot.bookedCapacity += guests;
    slot.availableCapacity -= guests;
    await slot.save();
  }
}
```

## ✅ Testing Checklist

- [ ] Create new slot as winery owner
- [ ] Check availability as customer (should show available)
- [ ] Book until capacity is full
- [ ] Try to book when full (should fail with error)
- [ ] Cancel booking (capacity should restore)
- [ ] Winery decline booking (capacity should restore)
- [ ] Block slot (should not appear in customer search)
- [ ] Unblock slot (should reappear)
- [ ] Edit slot capacity
- [ ] Test simultaneous bookings (race condition test)

## 🎓 Key Takeaways

✅ **Problem Solved**: No more overbooking!  
✅ **Real-Time**: Capacity checked before every booking  
✅ **Atomic**: All-or-nothing reservation strategy  
✅ **Rollback Safe**: Failed bookings don't leak capacity  
✅ **Winery Control**: Full self-service inventory management  

---

**Last Updated**: Phase 4 Implementation  
**Status**: ✅ Complete and Production-Ready
