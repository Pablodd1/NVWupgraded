# 📊 Gap Analysis - Current vs Required Functionality

## ✅ WHAT'S WORKING (Current Implementation)

### User Side:
- ✅ Browse wineries with filtering (AVA, wine type, price, features)
- ✅ View winery details
- ✅ Add wineries to itinerary
- ✅ Basic authentication (login/register)
- ✅ Booking system (basic)
- ✅ Stripe payment integration
- ✅ Uber/Lyft integration
- ✅ Directions/routing (OSRM + multiple nav apps)
- ✅ Age verification (21+)

### Winery Side:
- ⚠️ Basic admin dashboard exists
- ⚠️ Can view bookings (admin only)
- ⚠️ Can view/edit wineries (admin only)

### Technical:
- ✅ MongoDB database
- ✅ Next.js 15 with TypeScript
- ✅ JWT authentication
- ✅ API routes structure
- ✅ Models (User, Winery, Booking)

---

## ❌ MISSING FEATURES (Required Implementation)

### 1. USER REGISTRATION & PROFILE ❌

**Current State:**
```typescript
// User Model - INCOMPLETE
{
  name: string;        // ✅ Has
  email: string;       // ✅ Has
  password: string;    // ✅ Has
  dateOfBirth?: Date;  // ✅ Has
  role: string;        // ✅ Has (but only "admin" or "winery")
  // ❌ MISSING:
  // - firstName (separate from name)
  // - lastName
  // - phone number
  // - "customer" role
}
```

**Required:**
- ❌ First name field
- ❌ Last name field
- ❌ Phone number field
- ❌ Age validation (21+ required)
- ❌ "customer" role (currently only "admin" and "winery")
- ❌ User profile management page

---

### 2. ROLE-BASED ACCESS CONTROL (RBAC) ❌

**Current State:**
- ⚠️ Has roles: "admin" and "winery"
- ❌ Missing "customer" role
- ❌ No proper role separation
- ❌ Customers can see admin routes
- ❌ Wineries can see customer routes

**Required:**
```
Three Separate Roles:
1. CUSTOMER
   - Browse wineries
   - Filter and search
   - Book appointments
   - View own bookings
   - Cannot see winery dashboard
   - Cannot see admin panel

2. WINERY OWNER
   - Manage own winery ONLY
   - Edit winery information
   - Manage inventory/slots
   - View own bookings
   - Respond to bookings
   - Cannot see other wineries
   - Cannot see admin panel

3. ADMINISTRATOR
   - Create/assign winery accounts
   - Reset winery passwords
   - View all wineries
   - View all bookings
   - View all users
   - Manage system settings
   - Cannot be seen by others
```

---

### 3. WINERY DASHBOARD (Owner Self-Service) ❌

**Current State:**
- ⚠️ Admin dashboard exists at `/admin/dashboard`
- ❌ No separate winery owner dashboard
- ❌ Winery owners can't manage their own winery

**Required:**
```
Winery Dashboard Features:
├── Profile Management
│   ├── Edit winery information
│   ├── Update contact details
│   ├── Upload images
│   └── Manage business hours
│
├── Tasting Experiences
│   ├── Add/edit tasting packages
│   ├── Set pricing
│   ├── Define wine selections
│   ├── Add food pairings
│   └── Configure tours
│
├── Inventory Management ⭐ CRITICAL
│   ├── Set available time slots
│   ├── Define max guests per slot
│   ├── Real-time slot availability
│   ├── Auto-deduct on booking
│   └── Block/unblock dates
│
├── Booking Management
│   ├── View incoming bookings
│   ├── Confirm/decline bookings
│   ├── View booking details
│   ├── Contact customers
│   └── Export booking reports
│
└── Notifications
    ├── Email for new bookings
    ├── SMS for new bookings
    └── Booking confirmations
```

---

### 4. REAL-TIME INVENTORY SYSTEM ❌

**Current State:**
- ✅ Wineries have `available_slots: string[]`
- ✅ Wineries have `max_guests_per_slot: number`
- ❌ NO inventory tracking
- ❌ Slots don't deduct when booked
- ❌ Can overbook (critical issue)

**Required:**
```typescript
// NEW: Slot Inventory Model
{
  wineryId: ObjectId;
  date: Date;              // e.g., "2025-12-15"
  timeSlot: string;        // e.g., "10:00 AM"
  totalCapacity: number;   // e.g., 10 seats
  bookedCapacity: number;  // e.g., 6 seats
  availableCapacity: number; // e.g., 4 seats (auto-calculated)
  status: "available" | "limited" | "full" | "blocked";
  bookings: [BookingId];   // References to bookings
}
```

**Functionality:**
- ❌ Create slots when winery sets availability
- ❌ Auto-deduct capacity when booking confirmed
- ❌ Prevent overbooking
- ❌ Real-time availability check
- ❌ Restore capacity if booking cancelled
- ❌ Block specific dates (holidays, maintenance)

---

### 5. ADMIN DASHBOARD (User & Winery Management) ⚠️

**Current State:**
- ⚠️ Basic admin routes exist
- ✅ Can view bookings
- ✅ Can view wineries
- ❌ Cannot create winery accounts
- ❌ Cannot assign credentials
- ❌ Cannot reset passwords
- ❌ Cannot manage users

**Required:**
```
Admin Panel Features:
├── User Management
│   ├── View all users (customers)
│   ├── Search/filter users
│   ├── View user details
│   ├── Deactivate accounts
│   └── View booking history
│
├── Winery Management ⭐ CRITICAL
│   ├── Create new winery account
│   ├── Assign login credentials
│   ├── Reset winery passwords
│   ├── View all wineries
│   ├── Edit winery information
│   ├── Activate/deactivate wineries
│   └── View winery bookings
│
├── Booking Oversight
│   ├── View all bookings
│   ├── Filter by status/date
│   ├── Resolve disputes
│   └── Generate reports
│
└── System Settings
    ├── Configure email templates
    ├── Manage fees/commissions
    └── System-wide announcements
```

---

### 6. VOICE SEARCH & AI RECOMMENDATIONS ❌

**Current State:**
- ⚠️ `react-speech-recognition` library installed
- ⚠️ NLP libraries installed (compromise, natural)
- ⚠️ Hugging Face transformers installed
- ❌ Not implemented/used

**Required:**
```
Voice Search Features:
1. Microphone Button
   - Click to activate
   - Speech-to-text conversion
   - Display transcript

2. AI Processing
   - Extract wine preferences (red, white, sparkling)
   - Extract price range
   - Extract AVA/region preferences
   - Extract features (tours, food, organic)
   - Extract time preferences

3. Auto-Filtering
   - Apply extracted filters automatically
   - Show matching wineries
   - Fallback to manual if unclear

Example:
User says: "I want to find a red wine tasting in Oakville 
            under $100 with food pairings"

AI extracts:
  - wine_type: "Red"
  - ava: "Oakville"
  - max_price: 100
  - features: ["Food Available"]

Auto-applies filters → Shows results
```

---

### 7. EMAIL/SMS CONFIRMATIONS ⚠️

**Current State:**
- ✅ Nodemailer installed
- ✅ Email configuration in `.env`
- ❌ No email sending implemented
- ❌ No SMS capability

**Required:**
```
Notification System:

When Booking Created:
├── To Customer:
│   ├── Email confirmation
│   ├── SMS confirmation (optional)
│   ├── Booking details
│   ├── Date, time, winery
│   ├── Total cost
│   └── Cancellation policy
│
├── To Winery:
│   ├── Email notification
│   ├── SMS notification (optional)
│   ├── Customer details
│   ├── Booking information
│   └── Action required (confirm/decline)
│
└── To Admin:
    ├── Email notification (summary)
    └── Dashboard notification

When Booking Confirmed:
├── To Customer: Confirmation email/SMS
└── To Admin: Log entry

When Booking Cancelled:
├── To Customer: Cancellation email
├── To Winery: Cancellation notice
└── Inventory: Restore capacity
```

---

### 8. PAYMENT FLOW IMPROVEMENTS ⚠️

**Current State:**
- ✅ Stripe integration exists
- ✅ Three payment methods:
  - pay_stripe
  - pay_winery
  - external_booking
- ⚠️ Payment happens BEFORE confirmation

**Required:**
```
Improved Flow:
1. Customer books appointment
2. Winery receives notification
3. Winery confirms availability
4. Payment is processed
5. Confirmation sent to all parties
6. Inventory updated

Currently: Payment happens immediately (issues if winery declines)
```

---

### 9. WINERY LANDING PAGE (Individual) ⚠️

**Current State:**
- ✅ Exists at `/winery/[id]`
- ✅ Shows winery information
- ✅ Shows tasting options
- ✅ Has booking calendar
- ⚠️ Doesn't reflect real-time inventory

**Required:**
- ❌ Show real-time slot availability
- ❌ Disable fully booked slots
- ❌ Show "X spots remaining"
- ❌ Update dynamically on booking

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1: CRITICAL (Must Have) 🔴
1. **User Model Enhancement** - Add firstName, lastName, phone, customer role
2. **Role-Based Access Control** - Separate customer/winery/admin views
3. **Winery Dashboard** - Owner self-service portal
4. **Real-time Inventory System** - Prevent overbooking
5. **Admin: Create Winery Accounts** - Assign credentials

### Phase 2: HIGH PRIORITY (Essential) 🟡
6. **Email/SMS Confirmations** - Booking notifications
7. **Inventory Display** - Show real-time availability
8. **Admin: Password Reset** - For winery accounts
9. **Booking Confirmation Workflow** - Winery approval before payment

### Phase 3: MEDIUM PRIORITY (Important) 🟢
10. **Voice Search** - Microphone + AI filtering
11. **Admin Reports** - Analytics and insights
12. **User Profile Management** - Edit customer details
13. **Winery Analytics** - Dashboard insights

---

## 🛠️ TECHNICAL REQUIREMENTS

### Database Changes Needed:
```typescript
// 1. Update User Model
interface IUser {
  firstName: string;      // NEW
  lastName: string;       // NEW
  phone: string;          // NEW
  email: string;
  password: string;
  dateOfBirth: Date;
  role: "customer" | "winery" | "admin";  // UPDATED
  wineryId?: ObjectId;    // NEW (for winery owners)
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create Slot Inventory Model
interface ISlotInventory {
  wineryId: ObjectId;
  date: Date;
  timeSlot: string;
  totalCapacity: number;
  bookedCapacity: number;
  status: string;
  bookings: ObjectId[];
}

// 3. Update Booking Model
interface IBooking {
  userId: ObjectId;
  wineries: WineryBooking[];
  status: "pending" | "confirmed" | "declined" | "cancelled";
  confirmationCode: string;  // NEW
  notifications: {           // NEW
    customerEmail: boolean;
    customerSMS: boolean;
    wineryEmail: boolean;
    winerySMS: boolean;
  };
}
```

### API Routes Needed:
```
Customer Routes:
- POST /api/customer/register    (new fields)
- GET  /api/customer/profile
- PUT  /api/customer/profile
- GET  /api/customer/bookings

Winery Routes:
- GET  /api/winery/dashboard
- PUT  /api/winery/profile
- POST /api/winery/slots         (create/update)
- GET  /api/winery/slots
- GET  /api/winery/bookings
- PUT  /api/winery/bookings/:id  (confirm/decline)

Admin Routes:
- POST /api/admin/winery/create
- POST /api/admin/winery/reset-password
- GET  /api/admin/users
- GET  /api/admin/analytics

Inventory Routes:
- GET  /api/inventory/check      (real-time availability)
- POST /api/inventory/reserve    (temporary hold)
- POST /api/inventory/confirm    (finalize booking)

Voice Search:
- POST /api/voice/process        (speech to filters)
```

### UI Components Needed:
```
├── Winery Dashboard
│   ├── WineryLayout.tsx
│   ├── InventoryManager.tsx
│   ├── BookingList.tsx
│   ├── ProfileEditor.tsx
│   └── AnalyticsDashboard.tsx
│
├── Admin Dashboard
│   ├── AdminLayout.tsx
│   ├── CreateWineryForm.tsx
│   ├── UserList.tsx
│   ├── WineryList.tsx
│   └── SystemSettings.tsx
│
└── Customer Features
    ├── EnhancedRegistration.tsx
    ├── VoiceSearch.tsx
    ├── UserProfile.tsx
    └── BookingHistory.tsx
```

---

## 🎯 ESTIMATED EFFORT

| Feature | Complexity | Time Estimate |
|---------|-----------|---------------|
| User Model Enhancement | Low | 2 hours |
| RBAC Implementation | Medium | 8 hours |
| Winery Dashboard | High | 16 hours |
| Inventory System | High | 16 hours |
| Admin Create Winery | Medium | 6 hours |
| Email/SMS System | Medium | 8 hours |
| Voice Search + AI | High | 12 hours |
| Real-time Availability | Medium | 6 hours |
| Testing & QA | - | 8 hours |
| **TOTAL** | - | **~82 hours** |

---

## ✅ RECOMMENDATION

Start with **Phase 1 (Critical Features)** in this order:

1. ✅ **User Model Enhancement** (2 hours)
   - Add firstName, lastName, phone
   - Add "customer" role
   - Update registration form

2. ✅ **Role-Based Access Control** (8 hours)
   - Create role middleware
   - Separate routes by role
   - Protect admin/winery routes

3. ✅ **Winery Dashboard** (16 hours)
   - Create winery layout
   - Inventory management
   - Booking management
   - Profile editing

4. ✅ **Real-time Inventory** (16 hours)
   - Create slot model
   - Implement booking logic
   - Prevent overbooking
   - Auto-deduct capacity

5. ✅ **Admin: Create Winery** (6 hours)
   - Admin form to create accounts
   - Assign credentials
   - Send welcome emails

**Total Phase 1:** ~48 hours of development

This will give you a **fully functional MVP** with the core features working!

---

Would you like me to start implementing Phase 1?
