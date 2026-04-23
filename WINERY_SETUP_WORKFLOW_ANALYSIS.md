# Winery Setup Workflow Analysis

## Executive Summary
The NVW (Napa Valley Wineries) platform has **two distinct pathways** for winery setup:
1. **Admin-Created Accounts** - Admin creates winery account with basic info
2. **Self-Service Onboarding** - Winery owner registers and completes profile themselves

---

## 🔴 Critical Finding: Database Connectivity Issue
**Current Status**: The database is **OFFLINE**, preventing all authentication and registration workflows.

**Error Evidence from Browser Test**:
- Login attempts: "Database offline and invalid demo credentials"
- API endpoints failing: `/api/me` (500 Internal Server Error), `/api/auth/login` (400 Bad Request)
- Frontend read operations work (winery list displays), but write/auth operations fail

**Required Action**: Fix database connection before testing any workflows.

---

## Workflow 1: Admin-Created Winery Accounts

### Entry Point
**API Route**: `/api/admin/create-winery-account` (POST)
**File**: `src/app/api/admin/create-winery-account/route.ts`

### Access Control
- **Requires**: Admin role (enforced by `requireAdmin` middleware)
- **Security**: RBAC (Role-Based Access Control) prevents unauthorized access

### Process Flow

#### Step 1: Admin Submits Creation Request
Admin provides:
```json
{
  // User Account
  "firstName": "John",
  "lastName": "Doe",
  "email": "owner@winery.com",
  "password": "secure123",
  "phone": "+1-707-555-0123",
  
  // Winery Details
  "wineryName": "Estate Winery",
  "wineryAddress": "123 Vineyard Rd, Napa, CA",
  "wineryLat": 38.5025,
  "wineryLong": -122.2654,
  "wineryPhone": "+1-707-555-0456",
  "wineryEmail": "info@winery.com",
  "wineryWebsite": "winery.com",
  "wineryDescription": "Premium wines since 1985"
}
```

#### Step 2: User Account Creation
- **Role**: `winery`
- **Default DOB**: `1990-01-01` (admin-created accounts bypass age verification)
- **Age Verified**: `true`
- **Active**: `true`
- **Password**: Hashed automatically by User model pre-save hook

#### Step 3: Winery Profile Creation
Created with:
- **Basic Info**: Name, description, location
- **Contact Info**: Phone, email, website (auto-adds https:// if missing)
- **Empty Tasting Info**: `tasting_info: []` - Owner must fill this later
- **Default Amenities**: All set to `false`
- **Owner Reference**: Links to user account via `owner: userId`

#### Step 4: Link User to Winery
- Updates `User.wineryId` to point to the winery
- Creates bidirectional relationship

#### Step 5: Auto-Generate Booking Slots
- **Function**: `autoGenerateWinerySlots(winery, 30)`
- **Duration**: 30 days of availability slots
- **Note**: Only generates slots if tasting packages exist (initially empty)

#### Error Handling with Rollback
```javascript
// If winery creation fails → Delete user
// If user-winery link fails → Delete both user and winery
```
Ensures database consistency even on partial failures.

### What's Missing After Admin Creation
Admin creates **skeleton profile only**:
- ❌ No tasting packages
- ❌ No images
- ❌ No detailed booking info
- ❌ No wine details
- ❌ No special features

**Next Step**: Winery owner logs in and completes profile via dashboard.

---

## Workflow 2: Self-Service Winery Onboarding

### Entry Point
**Page**: `/winery-dashboard/onboarding`
**File**: `src/app/winery-dashboard/onboarding/page.tsx`

### Access Control
- **Requires**: Authenticated user with `winery` role
- **Uses**: `useAuthStore()` to verify authentication

### Process Flow

#### Step 1: Initial Information Gathering
**Form Fields**:
1. **Winery Name** (required)
2. **Description** (required, textarea)
3. **Address** (required, with Google Maps autocomplete)
   - Uses `AddressAutocomplete` component
   - Powered by Google Maps Places API
   - Returns: address, latitude, longitude
4. **Business Phone** (required)
5. **Winery Photos** (optional, multiple uploads)
   - Upload endpoint: `/api/upload`
   - Stored as URL array in state
   - Preview with delete option

#### Step 2: Image Upload System
```javascript
handleImageUpload(file) {
  POST /api/upload with FormData
  → Returns: { url: "https://..." }
  → Adds to images[] array
}
```
- **UI**: Grid display of uploaded images
- **Features**: Hover-to-remove functionality
- **Storage**: Image URLs (likely ImgBB or similar service)

#### Step 3: Profile Creation Payload
Constructs comprehensive winery object:
```javascript
{
  name: "Winery Name",
  description: "...",
  location: {
    address: "...",
    latitude: 0,  // TODO: Use geocoded values
    longitude: 0,
    is_mountain_location: false
  },
  contact_info: {
    phone: "...",
    email: user?.email || "",
    website: "..."
  },
  images: ["url1", "url2", ...],
  tasting_info: [{
    tasting_title: "Signature Tasting",
    tasting_description: "Our flagship wine tasting experience.",
    tasting_price: 50,
    base_booking_fee: 50,
    additional_guest_fee: 25,
    free_guests_included: 1,
    available_times: ["11:00", "13:00", "15:00"],
    wine_types: ["Red", "White"],
    booking_info: {
      booking_enabled: true,
      max_guests_per_slot: 8,
      available_slots: [],
      allow_excess_guests: false,
      excess_guest_multiplier: 1.5
    }
  }]
}
```

**Default Tasting Package**:
- Pre-populated with sensible defaults
- Owners can customize later in dashboard
- Ensures winery is immediately bookable

#### Step 4: API Submission
```javascript
POST /api/winery-dashboard/profile
```
**Handler**: `src/app/api/winery-dashboard/profile/route.ts`

**Verification**:
- Checks if winery already exists for this user
- If exists → Returns error (use PUT to update)
- Creates winery with `owner: userId`
- Updates `User.wineryId` reference

#### Step 5: Redirect to Dashboard
On success:
```javascript
router.push("/winery-dashboard")
```
Winery owner can now:
- View their profile
- Manage bookings
- Edit tasting packages
- Upload more images

### Known Issues/Limitations
1. **Geocoding Not Implemented**: Latitude/longitude hardcoded to `0, 0`
   ```javascript
   // TODO: Implement geocoding
   latitude: 0,
   longitude: 0
   ```
   
2. **Website Field Missing**: No input for website in onboarding form
   ```javascript
   website: ""  // Should be captured but isn't
   ```

---

## Workflow 3: Advanced Tasting Package Management

### Entry Point
**Components**:
- `src/components/winery-stepper/basic-info-step.tsx`
- `src/components/winery-stepper/tasting-booking-step.tsx`

### Features Available (988 lines of tasting management)

#### Basic Information Step
- Winery name, description
- Email, phone, website
- **Address with Map Selector**
  - Interactive map component
  - Click to select exact location
  - Returns lat/long coordinates
- Mountain location checkbox

#### Tasting Booking Step - Comprehensive Package Builder

##### 1. Multiple Tasting Packages
```javascript
addTasting(index)     // Add new package after current
addInitialTasting()   // Add first package
removeTasting(index)  // Delete package
```

##### 2. Pricing Configuration
**Per-Person Pricing Model**:
- **Base Booking Fee**: First guest price (e.g., $50)
- **Additional Guest Fee**: Per extra guest (e.g., $25)
- **Free Guests Included**: Number included in base fee (default: 1)

**Legacy Pricing**:
- **Tasting Price**: Fixed price (optional, overridden by per-person)

**Example Calculation**:
```
Base Fee: $50 (1 guest included)
Additional Fee: $25/guest
Booking: 4 guests
Cost: $50 + (3 × $25) = $125
```

##### 3. Guest Capacity Management
- **Number of People**: `[min, max]` range (e.g., [1, 10])
- **Max Guests Per Slot**: Hard limit (e.g., 8)
- **Validation**: Ensures min < max

##### 4. Excess Guest Handling
Revolutionary feature for large groups:
```javascript
{
  allow_excess_guests: true,
  excess_guest_multiplier: 1.5  // 50% premium
}
```

**How It Works**:
- Booking exceeds max_guests_per_slot (e.g., 12 guests, max is 8)
- System **automatically splits** into multiple time slots
- Additional slots charged at `base_price × multiplier`
- Example: 12 guests → Slot 1 (8 guests @ $100) + Slot 2 (4 guests @ $150)

##### 5. Availability Configuration
- **Available Times**: Multi-select dropdown (11:00, 13:00, 15:00, etc.)
- **Available Slots**: Date/time picker for specific slots
  - Component: `MultiDateTimePicker`
  - Stores as ISO strings: `dates.map(d => d.toISOString())`

##### 6. Wine Details Entry
Add individual wines with:
- Name, description, year, tasting notes
- **Wine Photo Upload**: `MultipleImageUpload` component
- Display in list with thumbnail previews
- Remove option per wine

##### 7. Food Pairing Options
```javascript
{
  id: UUID,
  name: "Artisan Cheese Board",
  price: 25
}
```
Add-on options with individual pricing.

##### 8. Tour Options
```javascript
{
  description: "Barrel Room Tour",
  cost: 35
}
```
Optional tours with separate pricing.

##### 9. Other Features
Custom features with costs:
```javascript
{
  description: "Private Tasting Room",
  cost: 100
}
```

##### 10. Wine Types & Special Features
- **Wine Types**: Multi-select (Red, White, Sparkling, Rosé, etc.)
- **Special Features**: Multi-select dropdown
  - Virtual sommelier
  - Augmented reality tours
  - Handicap accessible
  - Pet-friendly
  - Child-friendly

##### 11. AVA (American Viticultural Area)
Dropdown selector for regional designation:
- Napa Valley
- Sonoma County
- Russian River Valley
- (... full list from `/data/data.ts`)

##### 12. External Booking Integration
```javascript
external_booking_link: "https://resy.com/winery-name"
```
Redirect to third-party booking systems (Resy, OpenTable, etc.)

##### 13. Image Management
- **Tasting Package Images**: Multiple per package
- **Preview Grid**: 3-column responsive layout
- **Remove Actions**: 
  - Remove uploaded file before save
  - Remove saved image after save
- **Wine Photos**: Separate upload per wine

### State Management
```javascript
// Main winery data
const [formData, setFormData] = useState<Winery>(...)

// File uploads (not yet saved)
const [tastingImages, setTastingImages] = useState<{[key: number]: File[]}>({})
const [tastingWinePhotos, setTastingWinePhotos] = useState<{[key: number]: File[]}>({})

// Available slots
const [availableSlotDates, setAvailableSlotDates] = useState<Date[]>([])
```

### Input Validation
- **Number Fields**: Prevent empty strings causing NaN
  ```javascript
  // Allows empty input, only updates on valid number
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({})
  ```
- **Range Validation**: Min/max guest checks
- **Required Fields**: Enforced at submission

---

## API Routes Summary

### Winery Profile Management
**Endpoint**: `/api/winery-dashboard/profile`

#### GET - Retrieve Profile
- **Auth**: `requireWinery` (winery owner only)
- **Returns**: Winery owned by authenticated user
- **Error**: 404 if no winery found

#### POST - Create Profile
- **Auth**: `requireWinery`
- **Check**: Prevents duplicate (one winery per owner)
- **Creates**: New winery with owner reference
- **Updates**: Links `User.wineryId`

#### PUT - Update Profile
- **Auth**: `requireWinery`
- **Allowed Fields**:
  - name, description
  - location, contact_info
  - tasting_info
  - amenities, transportation
  - payment_method, other_features
  - images

### Admin Winery Creation
**Endpoint**: `/api/admin/create-winery-account`

#### POST - Create Complete Account
- **Auth**: `requireAdmin`
- **Creates**: User + Winery in single transaction
- **Generates**: 30-day booking slots
- **Rollback**: Deletes both on any failure

---

## Data Models

### User Model (Winery Owner)
```typescript
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string,
  password: string (hashed),
  phone: string,
  role: "winery",
  dateOfBirth: Date,
  ageVerified: boolean,
  isActive: boolean,
  wineryId: ObjectId  // Reference to Winery
}
```

### Winery Model
```typescript
{
  _id: ObjectId,
  owner: ObjectId,  // Reference to User
  name: string,
  description: string,
  location: {
    address: string,
    latitude: number,
    longitude: number,
    is_mountain_location: boolean
  },
  contact_info: {
    phone: string,
    email: string,
    website: string
  },
  images: string[],  // URLs
  tasting_info: [{
    tasting_title: string,
    tasting_description: string,
    tasting_price: number,  // Legacy
    base_booking_fee: number,
    additional_guest_fee: number,
    free_guests_included: number,
    available_times: string[],
    wine_types: string[],
    number_of_wines_per_tasting: number,
    special_features: string[],
    images: string[],
    food_pairing_options: [{
      id: string,
      name: string,
      price: number
    }],
    tours: {
      available: boolean,
      tour_price: number,
      tour_options: [{
        description: string,
        cost: number
      }]
    },
    wine_details: [{
      id: string,
      name: string,
      description: string,
      year?: number,
      tasting_notes: string,
      photo?: string
    }],
    ava: string,
    booking_info: {
      booking_enabled: boolean,
      max_guests_per_slot: number,
      number_of_people: [number, number],  // [min, max]
      dynamic_pricing: {
        enabled: boolean,
        weekend_multiplier: number
      },
      available_slots: string[],  // ISO date strings
      allow_excess_guests: boolean,
      excess_guest_multiplier: number,
      external_booking_link?: string
    },
    other_features: [{
      description: string,
      cost: number
    }]
  }],
  amenities: {
    virtual_sommelier: boolean,
    augmented_reality_tours: boolean,
    handicap_accessible: boolean
  },
  transportation: {
    uber_availability: boolean,
    lyft_availability: boolean,
    distance_from_user: number
  },
  user_reviews: [],
  payment_method: {}
}
```

---

## Recommendations for Improvement

### 🔴 Critical Priorities
1. **Fix Database Connection** - Blocking all workflows
2. **Implement Geocoding** - Currently hardcoded to 0,0
3. **Add Error Handling** - Better user feedback on failures

### 🟡 High Priority
4. **Complete Onboarding Form**
   - Add website field
   - Use actual geocoded coordinates
   - Validate all required fields

5. **Admin Dashboard** - Create UI for `/api/admin/create-winery-account`
   - Form for admin winery creation
   - List view of pending accounts
   - Approval workflow

6. **Testing Suite**
   - Unit tests for pricing calculations
   - Integration tests for workflows
   - E2E tests for complete registration

### 🟢 Nice to Have
7. **Image Optimization**
   - Compress on upload
   - Generate thumbnails
   - CDN integration

8. **Slot Auto-Generation**
   - Make duration configurable (currently 30 days)
   - Add blackout dates
   - Seasonal availability

9. **Booking Analytics**
   - Popular time slots
   - Revenue projections
   - Capacity utilization

---

## Conclusion

The winery setup workflow is **well-architected** with:
- ✅ Clear separation of concerns (Admin vs Self-Service)
- ✅ Comprehensive tasting package builder
- ✅ Advanced pricing models (per-person, excess guests)
- ✅ Robust error handling with rollback
- ✅ RBAC security throughout

**Blockers**:
- ❌ Database connectivity issue prevents testing
- ❌ Geocoding not implemented
- ❌ Some UI gaps in onboarding

**Next Steps**:
1. Fix database connection
2. Test complete registration flow
3. Verify admin creation workflow
4. Add missing UI fields
5. Implement geocoding service
