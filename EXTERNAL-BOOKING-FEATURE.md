# 🔗 External Booking Feature - Complete Guide

## 📋 Overview

The **External Booking** feature allows wineries to use their own booking systems while still tracking reservations through the Napa Valley Wineries platform.

✅ **8 Wineries Available** (including V. Sattui with external booking)  
✅ **Direct Booking Section** on homepage  
✅ **Inventory Tracking** without payment processing  
✅ **Email Notifications** for all parties  
✅ **User Account Integration** - all bookings in one place  

---

## 🎯 Quick Summary

### **What Was Implemented:**

1. ✅ **API Endpoint:** `/api/itinerary/external-booking`
2. ✅ **UI Component:** `DirectBookingSection` on homepage
3. ✅ **Database Support:** Updated Booking and Winery models
4. ✅ **Inventory Management:** Reduces capacity without payment
5. ✅ **Notifications:** Emails to customer, winery, and admin

### **How It Works:**

1. User clicks "Book Direct" on homepage
2. Redirected to winery's external booking page
3. Completes booking on winery's website
4. Winery notifies our API (or manual entry)
5. System tracks booking and reduces inventory
6. Everyone gets email confirmations
7. Booking appears in user's account

---

## 📊 Current Wineries

**Total:** 8 Wineries  
**With External Booking:** 1 (V. Sattui Winery)  
**Available for Regular Booking:** 7

### **V. Sattui Winery** (External Booking)
- Link: https://www.vsattui.com/visit/tastings
- Features: Picnic Area, Deli, Marketplace
- Price: From $45
- Status: ✅ **CONFIGURED**

---

## 🚀 Testing

### **View on Homepage:**
```
http://localhost:3000
```
Scroll to "Direct Booking Available" section

### **Test API:**
```bash
curl -X POST http://localhost:3000/api/itinerary/external-booking \
  -H "Content-Type: application/json" \
  -d '{
    "wineryId": "WINERY_ID",
    "tastingTitle": "Marketplace Tasting",
    "bookingDate": "2025-12-25",
    "bookingTime": "10:00 AM",
    "numberOfGuests": 4,
    "customerEmail": "test@example.com",
    "customerFirstName": "Test",
    "customerLastName": "User"
  }'
```

---

## ✅ Status

**Implementation:** ✅ COMPLETE  
**Testing:** ✅ READY  
**Documentation:** ✅ COMPLETE  
**Production:** ✅ DEPLOYED  

---

For full documentation, see the implementation files:
- `src/app/api/itinerary/external-booking/route.ts`
- `src/components/DirectBookingSection.tsx`
- `src/models/booking.model.ts`
