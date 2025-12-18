# 🚀 Implementation Plan - All Features

## ✅ COMPLETED SO FAR

### 1. User Model Enhancement ✅
- ✅ Added firstName, lastName fields
- ✅ Added phone number field
- ✅ Added "customer" role (now: customer, winery, admin)
- ✅ Added wineryId reference for winery owners
- ✅ Added isActive flag

### 2. SlotInventory Model ✅
- ✅ Created complete slot tracking system
- ✅ Tracks totalCapacity, bookedCapacity, availableCapacity
- ✅ Status management (available, limited, full, blocked)
- ✅ Auto-calculates availability
- ✅ Methods: checkAvailability, reserveCapacity, releaseCapacity
- ✅ Compound index for performance

### 3. RBAC System ✅
- ✅ Created comprehensive role-based access control
- ✅ Middleware for: requireAuth, requireRole, requireCustomer, requireWinery, requireAdmin
- ✅ Ownership validation (wineryOwnership)
- ✅ Updated auth.ts with proper token payload

---

## 📋 REMAINING IMPLEMENTATION

### PHASE 1: CORE AUTHENTICATION & AUTHORIZATION

#### A. Update Auth APIs (Critical)
**Files to Modify:**
1. `/src/app/api/auth/register/route.ts`
   - Add firstName, lastName, phone fields
   - Default role to "customer"
   - Age validation (21+)
   
2. `/src/app/api/auth/login/route.ts`
   - Return full user object with new fields
   - Include role and wineryId in token

3. `/src/app/api/me/route.ts`
   - Return new user fields
   - Use RBAC middleware

#### B. Update Frontend Auth Components
**Files to Modify:**
1. `/src/components/modal/AuthModal.tsx`
   - Add firstName, lastName, phone inputs
   - Update validation
   - Age verification checkbox

2. `/src/store/authStore.ts`
   - Update user interface with new fields
   - Add role, wineryId

---

### PHASE 2: WINERY DASHBOARD

#### A. Create Winery Dashboard Structure
**New Files:**
```
src/app/winery-dashboard/
├── layout.tsx              (Protected layout for winery users)
├── page.tsx                (Dashboard overview)
├── profile/
│   └── page.tsx            (Edit winery profile)
├── inventory/
│   └── page.tsx            (Manage slots & availability)
├── bookings/
│   └── page.tsx            (View & manage bookings)
└── analytics/
    └── page.tsx            (Stats & insights)
```

#### B. Create Winery Dashboard Components
**New Components:**
```
src/components/winery-dashboard/
├── WineryLayout.tsx        (Sidebar navigation)
├── ProfileEditor.tsx       (Edit winery info)
├── InventoryManager.tsx    (Slot management calendar)
├── BookingList.tsx         (Incoming bookings table)
├── BookingCard.tsx         (Individual booking card)
└── Analytics.tsx           (Charts & metrics)
```

#### C. Create Winery APIs
**New API Routes:**
```
src/app/api/winery-dashboard/
├── profile/route.ts        (GET, PUT winery info)
├── slots/route.ts          (GET, POST, PUT slots)
├── slots/[id]/route.ts     (Individual slot management)
├── bookings/route.ts       (GET winery's bookings)
├── bookings/[id]/
│   ├── confirm/route.ts    (Confirm booking)
│   └── decline/route.ts    (Decline booking)
└── analytics/route.ts      (Get stats)
```

---

### PHASE 3: ADMIN DASHBOARD

#### A. Enhance Admin Dashboard
**Files to Modify/Create:**
```
src/app/admin/dashboard/
├── users/
│   └── page.tsx            (NEW: User management)
├── winery/
│   ├── create/
│   │   └── page.tsx        (NEW: Create winery form)
│   ├── list/
│   │   └── page.tsx        (ENHANCE: Add actions)
│   └── [id]/
│       ├── edit/page.tsx   (Edit winery)
│       └── reset-password/page.tsx  (NEW: Reset password)
└── settings/
    └── page.tsx            (NEW: System settings)
```

#### B. Create Admin Components
**New Components:**
```
src/components/admin/
├── CreateWineryForm.tsx    (Form to create winery account)
├── UserManagement.tsx      (User list & actions)
├── WineryManagement.tsx    (Winery list & actions)
├── ResetPasswordModal.tsx  (Reset winery password)
└── SystemSettings.tsx      (App configuration)
```

#### C. Create Admin APIs
**New API Routes:**
```
src/app/api/admin/
├── users/
│   ├── route.ts            (GET all users)
│   └── [id]/
│       ├── route.ts        (GET, PUT, DELETE user)
│       └── deactivate/route.ts  (Deactivate user)
├── winery/
│   ├── create/route.ts     (POST: Create winery account)
│   ├── reset-password/route.ts  (POST: Reset password)
│   └── assign/route.ts     (Assign winery to user)
└── analytics/route.ts      (System-wide analytics)
```

---

### PHASE 4: REAL-TIME INVENTORY INTEGRATION

#### A. Update Booking Flow
**Files to Modify:**
```
src/app/api/itinerary/book/route.ts
```
**Changes:**
1. Check slot availability before booking
2. Reserve capacity temporarily
3. Deduct capacity on payment confirmation
4. Release capacity on cancellation

#### B. Update Winery Detail Page
**Files to Modify:**
```
src/app/winery/[id]/page.tsx
src/components/booking-calendar.tsx
```
**Changes:**
1. Fetch real-time slot availability
2. Disable fully booked slots
3. Show "X spots remaining"
4. Update on selection

#### C. Create Inventory API
**New API Route:**
```
src/app/api/inventory/
├── check/route.ts          (Check availability)
├── reserve/route.ts        (Temporary hold)
├── confirm/route.ts        (Confirm reservation)
└── release/route.ts        (Cancel/release)
```

---

### PHASE 5: NOTIFICATIONS (Email/SMS)

#### A. Create Notification Service
**New File:**
```
src/lib/notifications.ts
```
**Functions:**
- `sendBookingConfirmationEmail()`
- `sendBookingNotificationToWinery()`
- `sendAdminNotification()`
- `sendBookingConfirmationSMS()` (optional)

#### B. Create Email Templates
**New Directory:**
```
src/lib/email-templates/
├── booking-confirmation-customer.html
├── booking-notification-winery.html
├── booking-confirmed-customer.html
├── booking-declined-customer.html
└── winery-welcome.html
```

#### C. Integrate Notifications
**Files to Modify:**
1. `/src/app/api/itinerary/book/route.ts` - Send on booking
2. `/src/app/api/winery-dashboard/bookings/[id]/confirm/route.ts` - Send on confirm
3. `/src/app/api/admin/winery/create/route.ts` - Send welcome email

---

### PHASE 6: VOICE SEARCH & AI

#### A. Create Voice Search Component
**New Component:**
```
src/components/voice-search/
├── VoiceSearchButton.tsx   (Microphone button)
├── VoiceTranscript.tsx     (Show what user said)
└── FilterSuggestions.tsx   (Show extracted filters)
```

#### B. Create AI Processing API
**New API Route:**
```
src/app/api/voice/
└── process/route.ts        (Process speech & extract filters)
```
**Logic:**
1. Receive transcript
2. Use NLP to extract:
   - Wine types (red, white, sparkling, etc.)
   - Price range
   - AVA/region
   - Features (tours, food, organic)
   - Time preferences
3. Return structured filter object

#### C. Update Home Page
**Files to Modify:**
```
src/app/page.tsx
```
**Changes:**
1. Add VoiceSearchButton
2. Process AI results
3. Auto-apply filters
4. Show results

---

### PHASE 7: ENHANCED BOOKING WORKFLOW

#### A. Add Booking Confirmation Flow
**New Status:**
```
Booking States:
- pending (waiting for winery confirmation)
- confirmed (winery approved)
- declined (winery rejected)
- cancelled (customer cancelled)
- completed (past date)
```

#### B. Update Booking Model
**File to Modify:**
```
src/models/booking.model.ts
```
**Add:**
- confirmationCode (unique ID)
- wineryResponse (confirmed/declined/pending)
- wineryResponseDate
- cancelledBy (customer/winery/admin)
- cancellationReason

#### C. Create Booking Management UI
**New Components:**
```
src/components/bookings/
├── CustomerBookingList.tsx  (Customer's bookings)
├── BookingDetails.tsx       (Full booking info)
├── CancelBookingModal.tsx   (Cancel with reason)
└── BookingStatus.tsx        (Visual status indicator)
```

---

### PHASE 8: USER PROFILE MANAGEMENT

#### A. Create Customer Profile Page
**New Files:**
```
src/app/profile/
├── page.tsx                (View/edit profile)
└── bookings/
    └── page.tsx            (Booking history)
```

#### B. Create Profile API
**New API Route:**
```
src/app/api/customer/
├── profile/route.ts        (GET, PUT profile)
└── bookings/route.ts       (GET customer's bookings)
```

---

## 📊 DATABASE MIGRATIONS NEEDED

### 1. Update Existing Users
```javascript
// Migration script to add new fields to existing users
db.users.updateMany(
  { firstName: { $exists: false } },
  {
    $set: {
      firstName: "",
      lastName: "",
      phone: "",
      role: "customer",
      isActive: true
    }
  }
);
```

### 2. Create Slot Inventory for Existing Wineries
```javascript
// Generate slots for next 90 days for all wineries
// Based on winery's available_times
```

---

## 🧪 TESTING CHECKLIST

### Unit Tests
- [ ] User model validation
- [ ] SlotInventory capacity calculations
- [ ] RBAC middleware authorization
- [ ] Token generation/verification

### Integration Tests
- [ ] Registration flow with all fields
- [ ] Login with different roles
- [ ] Winery dashboard access control
- [ ] Admin create winery account
- [ ] Booking with slot deduction
- [ ] Email sending on booking
- [ ] Voice search processing

### End-to-End Tests
- [ ] Customer: Browse → Filter → Book → Confirm
- [ ] Winery: Login → View Booking → Confirm
- [ ] Admin: Create Winery → Assign Password
- [ ] Inventory: Book → Check Deduction → Cancel → Check Restoration

---

## ⏱️ ESTIMATED TIME

| Phase | Hours | Priority |
|-------|-------|----------|
| Phase 1: Auth Updates | 6 | Critical |
| Phase 2: Winery Dashboard | 20 | Critical |
| Phase 3: Admin Dashboard | 12 | Critical |
| Phase 4: Inventory Integration | 10 | Critical |
| Phase 5: Notifications | 8 | High |
| Phase 6: Voice Search & AI | 12 | High |
| Phase 7: Booking Workflow | 8 | Medium |
| Phase 8: User Profiles | 4 | Medium |
| Testing & QA | 10 | Critical |
| **TOTAL** | **90 hours** | |

---

## 🎯 IMPLEMENTATION ORDER

### Sprint 1 (Critical Foundation - 36 hours)
1. ✅ Update User Model (Done)
2. ✅ Create SlotInventory Model (Done)
3. ✅ Create RBAC System (Done)
4. Update Auth APIs (register, login)
5. Update Auth Frontend Components
6. Create basic Winery Dashboard structure
7. Create Winery Profile Editor
8. Create Admin: Create Winery form & API

### Sprint 2 (Core Features - 30 hours)
9. Implement Inventory Manager component
10. Integrate slot checking in booking flow
11. Implement slot deduction on booking
12. Create email notification system
13. Integrate notifications in booking flow
14. Update winery detail page with real-time slots

### Sprint 3 (Enhanced Features - 24 hours)
15. Create Voice Search component
16. Implement AI filter extraction
17. Create Winery Booking Management
18. Create Customer Profile & Booking History
19. Implement booking confirmation workflow
20. Add Admin User Management

---

## 📝 NOTES

- Each phase builds on previous phases
- Can be implemented incrementally
- Each feature is independently testable
- Database migrations should be run before deployment
- Comprehensive testing after each sprint

---

**Ready to continue implementation?** 
Current status: ✅ Models & RBAC ready
Next: Update Auth APIs and Frontend
