# SYSTEM CONTRACT - Napa Valley Wineries (NVW)

> **This document is the law of the system. All changes must validate against this contract.**

---

## 1. PURPOSE

A web platform for discovering, booking, and managing wine tasting experiences at Napa Valley wineries.

### Target Users
- **Customers**: Browse wineries, book tastings, manage itineraries
- **Winery Owners**: Manage their winery profile, handle bookings, update availability
- **Admins**: Oversee platform, create winery accounts, manage users

---

## 2. CORE FEATURES

### 2.1 Customer Features
- [x] Browse wineries with filters (location, price, wine type)
- [x] AI-powered search concierge (chat widget)
- [x] Book wine tastings
- [x] Create and manage itineraries
- [x] View booking history
- [x] User authentication (register/login)
- [x] Password reset functionality

### 2.2 Winery Owner Features
- [x] Winery dashboard
- [x] Manage winery profile
- [x] Handle booking requests
- [x] Update availability/slots

### 2.3 Admin Features
- [x] Admin dashboard
- [x] Create winery accounts
- [x] Manage all users
- [x] View platform statistics

---

## 3. DATA MODELS

### 3.1 User Model
```
- _id: ObjectId
- firstName: string (required)
- lastName: string (required)
- email: string (unique, required)
- password: string (hashed)
- phone: string
- dateOfBirth: Date
- role: "customer" | "winery" | "admin"
- wineryId: ObjectId (for winery role)
- isActive: boolean
- ageVerified: boolean
- smsOptIn: boolean
- resetToken: string (for password reset)
- resetTokenExpiry: Date
```

### 3.2 Winery Model
```
- _id: ObjectId
- name: string (required)
- owner: ObjectId (User reference)
- location: { address, latitude, longitude }
- contact_info: { phone, email, website }
- description: string
- tasting_info: Array of tasting options
- amenities: object
- user_reviews: Array
```

### 3.3 Booking Model
```
- _id: ObjectId
- customerId: ObjectId (User)
- wineryId: ObjectId (Winery)
- datetime: Date
- numberOfGuests: number
- status: "pending" | "confirmed" | "cancelled"
- specialRequests: string
```

### 3.4 SlotInventory Model
```
- _id: ObjectId
- wineryId: ObjectId
- date: Date
- timeSlot: string
- totalCapacity: number
- bookedCapacity: number
- availableCapacity: number
- status: "available" | "full" | "closed"
```

---

## 4. API ENDPOINTS

### 4.1 Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/me` - Get current user

### 4.2 Wineries
- `GET /api/winery` - List wineries (paginated)
- `GET /api/winery/[id]` - Get single winery
- `POST /api/winery` - Create winery (admin)
- `PUT /api/winery/[id]` - Update winery

### 4.3 Bookings
- `GET /api/itinerary` - Get user bookings
- `POST /api/itinerary` - Create booking
- `PUT /api/itinerary/[id]` - Update booking

### 4.4 Admin
- `POST /api/admin/create-winery-account` - Create winery owner + winery
- `GET /api/admin/users` - List users
- `GET /api/admin/stats` - Platform statistics

### 4.5 Support
- `POST /api/support` - Submit support request (sends to support@napavalleywineries.com)
- `GET /api/support` - Get support contact information

### 4.6 Winery Dashboard
- `GET /api/winery-dashboard/bookings` - Winery's bookings
- `PUT /api/winery-dashboard/bookings/[id]` - Update booking status

---

## 5. UI STRUCTURE

### 5.1 Public Pages
- `/` - Homepage with winery listings
- `/winery/[id]` - Winery detail page
- `/itinerary` - User's itinerary
- `/bookings` - Booking history
- `/support` - Help Center (FAQs + Contact form + Support info)
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form

### 5.2 Protected Pages
- `/admin/dashboard` - Admin dashboard (admin only)
- `/admin/dashboard/create-winery` - Create winery account
- `/admin/dashboard/users` - Manage users
- `/winery-dashboard` - Winery owner dashboard (winery only)

### 5.3 Components
- `Navbar` - Main navigation (desktop + mobile bottom nav)
- `ChatWidget` - AI concierge (floating button, bottom-left on mobile)
- `AuthModal` - Login/Register modal
- `AgeGate` - Age verification

---

## 6. BUSINESS LOGIC RULES

### 6.1 Authentication
- Users must be 21+ to register (wine industry compliance)
- Passwords must be minimum 6 characters
- JWT tokens stored in HTTP-only cookies
- Session expires after 7 days

### 6.2 Slot Inventory System (LIVE)
The slot inventory system is **LIVE** with real-time capacity management:

**How it works:**
1. **Auto-generation**: When a winery is created, slots are auto-generated for the next 30 days
   - 3 time slots per day: Morning (10AM-12PM), Afternoon (1PM-3PM), Evening (4PM-6PM)
   - Default capacity: 10-20 guests per slot
2. **Real-time deduction**: When a booking is made:
   - `bookedCapacity` is incremented atomically
   - `availableCapacity` is decremented atomically
   - Uses MongoDB's `findOneAndUpdate` with atomic `$inc` for race condition safety
3. **Status updates**: Pre-save middleware automatically updates slot status:
   - `available`: >30% capacity remaining
   - `limited`: ≤30% capacity remaining
   - `full`: 0 capacity remaining
   - `blocked`: Manually blocked by winery owner
4. **Cancellation rollback**: If booking fails or is cancelled:
   - Capacity is restored via `releaseCapacity()` method
5. **Daily reset**: Slots do NOT auto-reset daily (they persist)
   - New slots are generated as dates approach (rolling 30-day window via cron)

**Key Methods (slotInventory.model.ts):**
- `checkAvailability(wineryId, date, timeSlot, requiredCapacity)` - Verify slot availability
- `reserveCapacity(wineryId, date, timeSlot, capacity, bookingId)` - Reserve spots
- `releaseCapacity(wineryId, date, timeSlot, capacity, bookingId)` - Release on cancellation

### 6.3 Bookings
- Only authenticated users can book
- Bookings require available slot capacity (checked atomically)
- Capacity is reserved at booking time (not confirmation)
- If any slot reservation fails, all reserved slots are rolled back
- Winery owners can confirm/reject bookings
- Customers can cancel before the booking date

### 6.4 Role Access
- `customer`: Can book, view own bookings
- `winery`: Can manage own winery only
- `admin`: Full access to all resources

### 6.5 Voice Search (AI-Powered)
The voice search feature allows customers to find wineries using natural language:

**How it works:**
1. User clicks microphone icon in navbar
2. Browser's Web Speech API transcribes audio to text
3. Text is sent to AI NLP processor (`processNaturalLanguageAI`)
4. AI extracts filters: wine types, AVAs, features, price range, time preference
5. Filters are applied to winery search
6. Supported browsers: Chrome, Edge (uses Web Speech API)

---

## 7. DEPLOYMENT RULES

### 7.1 Environment
- **Platform**: Vercel
- **Database**: MongoDB Atlas
- **Branch**: `main` (single branch policy)

### 7.2 Build Requirements
- All TypeScript errors must be resolved
- ESLint warnings allowed (errors block build)
- No dynamic requires of optional packages

### 7.3 Environment Variables (Required)
```
MONGODB_URI
JWT_SECRET
NEXT_PUBLIC_APP_URL
```

### 7.4 Environment Variables (Optional - Disabled)
```
RESEND_API_KEY (email - mocked)
PLIVO_AUTH_ID (SMS - disabled)
PLIVO_AUTH_TOKEN (SMS - disabled)
```

---

## 8. FORBIDDEN ACTIONS

- ❌ Creating new branches
- ❌ Merging from external branches
- ❌ Adding new dependencies without validation
- ❌ Modifying data models without updating this contract
- ❌ Dynamic `require()` statements
- ❌ Implicit `any` types in TypeScript

---

## 9. CHANGE PROTOCOL

1. Validate change against this contract
2. If conflict exists, STOP and explain
3. Make minimal, focused changes
4. Test locally before commit
5. Single commit per fix
6. Push to `main` only

---

## 10. CURRENT STATUS

**Last Updated**: 2026-01-12
**Anchor Branch**: master (to be renamed to main)
**Build Status**: Pending (TypeScript fix deployed)
**Deployment**: Vercel auto-deploy on push

### Known Disabled Features
- Email notifications (mocked)
- SMS/WhatsApp notifications (disabled)

### Active Features
- All core booking functionality
- User authentication
- Admin winery creation
- AI chat concierge
