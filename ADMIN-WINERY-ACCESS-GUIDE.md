# 🔐 ADMIN & WINERY DASHBOARD ACCESS GUIDE

## 📋 **OVERVIEW**

Your platform has **3 user types**:
1. **👤 Customers** - Browse and book wine tastings
2. **🍷 Winery Owners** - Manage their winery, bookings, and inventory
3. **👨‍💼 Super Administrator** - Full platform control, create wineries, manage users

---

## 👨‍💼 **SUPER ADMINISTRATOR ACCESS**

### **🔑 Login Credentials:**
```
Email:    admin@napawineries.com
Password: admin123
Role:     Super Administrator
```

### **🌐 How to Access:**

1. **Go to platform:**
   ```
   https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai
   ```

2. **Click "Login"** (top right navigation)

3. **Enter credentials:**
   - Email: `admin@napawineries.com`
   - Password: `admin123`

4. **Access Admin Dashboard:**
   - After login, click **"Admin"** in navigation
   - Or go directly to: `/admin/dashboard`

### **📊 Admin Dashboard URL:**
```
https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai/admin/dashboard
```

---

## 🎯 **SUPER ADMIN CAPABILITIES**

### **1. CREATE WINERY ACCOUNTS** ⭐ **MOST IMPORTANT**

**Path:** `/admin/dashboard/create-winery`

**Full URL:**
```
https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai/admin/dashboard/create-winery
```

**What You Can Do:**
- ✅ Create new winery owner account
- ✅ Set owner's login credentials (email & password)
- ✅ Create winery profile (name, location, contact)
- ✅ Owner can then login and manage their winery

**Form Fields Required:**

**Owner Account:**
- First Name
- Last Name
- Email (owner's login email)
- Password (owner's login password)
- Confirm Password
- Phone Number

**Winery Details:**
- Winery Name
- Address
- Latitude (optional)
- Longitude (optional)
- Phone
- Email
- Website
- Description

**After Creation:**
- ✅ New winery owner can login with provided email/password
- ✅ Owner has access to winery dashboard
- ✅ Owner can manage bookings, slots, and profile

---

### **2. VIEW ALL BOOKINGS**

**Path:** `/admin/dashboard/bookings`

**What You Can See:**
- ✅ ALL bookings across ALL wineries
- ✅ Customer information
- ✅ Booking dates and times
- ✅ Booking status (pending, confirmed, cancelled)
- ✅ Payment information
- ✅ Special requests

**What You Can Do:**
- ✅ Confirm bookings
- ✅ Cancel bookings
- ✅ View booking details
- ✅ Contact customers
- ✅ Export data

---

### **3. MANAGE USERS**

**Path:** `/admin/dashboard/users`

**What You Can See:**
- ✅ All customers
- ✅ All winery owners
- ✅ All administrators
- ✅ User registration dates
- ✅ User activity

**What You Can Do:**
- ✅ View user profiles
- ✅ Edit user information
- ✅ Reset passwords
- ✅ Deactivate accounts
- ✅ Delete users
- ✅ Change user roles

---

### **4. PLATFORM STATISTICS**

**Path:** `/admin/dashboard`

**What You Can See:**
- ✅ Total bookings
- ✅ Total revenue
- ✅ Active wineries
- ✅ Total customers
- ✅ Booking trends
- ✅ Popular wineries
- ✅ Revenue by winery

---

## 🍷 **WINERY OWNER DASHBOARD**

### **🔑 Test Winery Owner Credentials:**
```
Email:    owner@napawineries.com
Password: owner123
Winery:   Opus One Winery
Role:     Winery Owner
```

### **🌐 How to Access:**

1. **Login with winery credentials**
2. **Navigate to:** `/winery-dashboard`
3. **Or click "Winery Dashboard" in navigation (after login)**

### **📊 Winery Dashboard URL:**
```
https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai/winery-dashboard
```

---

## 🎯 **WINERY OWNER CAPABILITIES**

### **1. MANAGE WINERY PROFILE** ⭐

**Path:** `/winery-dashboard/profile`

**What Can Be Updated:**

**Basic Information:**
- ✅ Winery Name
- ✅ Description
- ✅ Address
- ✅ Phone Number
- ✅ Email
- ✅ Website
- ✅ Opening Hours

**Tasting Experiences:**
- ✅ Tasting Title (e.g., "Premium Reserve Tasting")
- ✅ Description
- ✅ Price
- ✅ Duration
- ✅ Available times
- ✅ Wine types included
- ✅ Special features

**Food Pairings:**
- ✅ Pairing name
- ✅ Description
- ✅ Price
- ✅ Available with which tastings

**Tours:**
- ✅ Tour name (e.g., "Vineyard Tour")
- ✅ Description
- ✅ Price
- ✅ Duration
- ✅ Availability

**Features & Amenities:**
- ✅ Pet-friendly
- ✅ Wheelchair accessible
- ✅ Outdoor seating
- ✅ Private rooms
- ✅ Sommelier available
- ✅ AR/VR experiences

**Photos:**
- ✅ Upload winery photos
- ✅ Tasting room images
- ✅ Vineyard views
- ✅ Wine bottle photos

---

### **2. MANAGE BOOKING SLOTS (INVENTORY)** ⭐

**Path:** `/winery-dashboard/inventory`

**What You Can Do:**

**View Slots:**
- ✅ See all available slots (90 days)
- ✅ Date and time
- ✅ Total capacity
- ✅ Booked capacity
- ✅ Available capacity
- ✅ Status (available, full, blocked)

**Create New Slots:**
- ✅ Select date
- ✅ Choose time slot:
  - Morning (10 AM - 12 PM)
  - Afternoon (12 PM - 3 PM)
  - Evening (3 PM - 6 PM)
- ✅ Set capacity (e.g., 8 guests)
- ✅ Set status (available/blocked)

**Update Existing Slots:**
- ✅ Change capacity
- ✅ Block/unblock slots
- ✅ See booking count

**Prevent Overbooking:**
- ✅ Real-time capacity tracking
- ✅ Automatic slot blocking when full
- ✅ Cannot reduce capacity below booked count

---

### **3. MANAGE BOOKINGS** ⭐

**Path:** `/winery-dashboard/bookings`

**What You Can See:**

**Booking Information:**
- ✅ Customer name
- ✅ Customer email
- ✅ Customer phone
- ✅ Booking date & time
- ✅ Number of guests
- ✅ Selected tasting
- ✅ Food pairings
- ✅ Tours
- ✅ Special requests
- ✅ Payment method
- ✅ Booking status

**What You Can Do:**

**Confirm Bookings:**
- ✅ Review booking request
- ✅ Click "Confirm"
- ✅ Customer receives confirmation email
- ✅ Booking status changes to "confirmed"

**Decline Bookings:**
- ✅ If you can't accommodate
- ✅ Click "Decline"
- ✅ Customer receives notification
- ✅ Slot capacity is released

**Filter Bookings:**
- ✅ View by status (pending, confirmed, cancelled)
- ✅ View by date
- ✅ Search by customer name

**Communication:**
- ✅ See customer contact info
- ✅ Email customers directly
- ✅ Call customers if needed

---

### **4. VIEW STATISTICS**

**Path:** `/winery-dashboard` (home)

**What You Can See:**

**Today's Overview:**
- ✅ Today's bookings
- ✅ Pending requests
- ✅ Confirmed bookings
- ✅ Expected guests

**Capacity Management:**
- ✅ Total slots available
- ✅ Booked slots
- ✅ Available slots
- ✅ Utilization percentage

**Revenue Tracking:**
- ✅ Today's revenue
- ✅ This week's revenue
- ✅ This month's revenue
- ✅ Revenue by tasting type

**Performance Metrics:**
- ✅ Booking conversion rate
- ✅ Average party size
- ✅ Popular time slots
- ✅ Popular tastings

---

## 📝 **STEP-BY-STEP: CREATE NEW WINERY OWNER**

### **As Super Administrator:**

1. **Login as admin:**
   - Email: `admin@napawineries.com`
   - Password: `admin123`

2. **Navigate to Create Winery:**
   - Click "Admin" in navigation
   - Click "Create Winery Account"
   - Or go to: `/admin/dashboard/create-winery`

3. **Fill Owner Information:**
   ```
   First Name:       John
   Last Name:        Smith
   Email:            john@cabernetestate.com
   Password:         [secure-password]
   Confirm Password: [secure-password]
   Phone:            +1 (707) 555-1234
   ```

4. **Fill Winery Information:**
   ```
   Winery Name:        Cabernet Estate
   Address:            1234 Vineyard Lane, Napa, CA 94558
   Latitude:           38.2975 (optional)
   Longitude:          -122.2869 (optional)
   Phone:              +1 (707) 555-5678
   Email:              info@cabernetestate.com
   Website:            https://cabernetestate.com
   Description:        Family-owned estate specializing in 
                       premium Cabernet Sauvignon...
   ```

5. **Click "Create Winery Account"**

6. **Success!**
   - Winery owner account created
   - Winery profile created
   - Owner can now login with: `john@cabernetestate.com`

---

### **As New Winery Owner (john@cabernetestate.com):**

1. **Login:**
   - Email: `john@cabernetestate.com`
   - Password: [password set by admin]

2. **Complete Winery Profile:**
   - Go to: `/winery-dashboard/profile`
   - Add tasting experiences
   - Add food pairing options
   - Add tour options
   - Upload photos
   - Set opening hours

3. **Create Booking Slots:**
   - Go to: `/winery-dashboard/inventory`
   - Click "Create New Slot"
   - Select dates for next 90 days
   - Set time slots (morning, afternoon, evening)
   - Set capacity per slot
   - Save

4. **Manage Bookings:**
   - Go to: `/winery-dashboard/bookings`
   - Review incoming bookings
   - Confirm or decline as needed
   - Customer receives email notification

---

## 🔄 **USER WORKFLOW DIAGRAM**

```
CUSTOMER
   ↓
Browse Wineries → Add to Itinerary → Select Date/Time → Book
   ↓
BOOKING CREATED (status: pending)
   ↓
WINERY OWNER receives notification
   ↓
Login → View Bookings → Confirm or Decline
   ↓
CUSTOMER receives confirmation email
   ↓
BOOKING CONFIRMED (status: confirmed)
   ↓
Customer visits winery on booking date
```

```
SUPER ADMIN
   ↓
Create Winery Account → Sets owner email/password
   ↓
WINERY OWNER receives credentials
   ↓
Login → Complete Profile → Create Slots
   ↓
Winery appears on platform
   ↓
Customers can book
   ↓
Owner manages bookings
```

---

## 🎯 **QUICK REFERENCE**

### **URLs:**
```
Platform:              https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai

Admin Dashboard:       /admin/dashboard
Create Winery:         /admin/dashboard/create-winery
Manage Users:          /admin/dashboard/users
All Bookings:          /admin/dashboard/bookings

Winery Dashboard:      /winery-dashboard
Winery Profile:        /winery-dashboard/profile
Manage Slots:          /winery-dashboard/inventory
Winery Bookings:       /winery-dashboard/bookings
```

### **Test Credentials:**
```
Super Admin:
  Email:    admin@napawineries.com
  Password: admin123

Winery Owner:
  Email:    owner@napawineries.com
  Password: owner123
  Winery:   Opus One Winery

Customer:
  Email:    customer@test.com
  Password: customer123
```

---

## 🔐 **SECURITY NOTES**

### **For Production Deployment:**

1. **Change Default Passwords:**
   - Admin password: `admin123` → Strong password
   - Test accounts → Delete or change passwords

2. **Email Configuration:**
   - Set up real email service (SendGrid)
   - Configure email notifications
   - Add your domain

3. **Environment Variables:**
   - Update `JWT_SECRET` to strong random string
   - Set secure MongoDB connection
   - Configure Stripe keys (when ready)

---

## ❓ **COMMON QUESTIONS**

### **Q: How do I add more wineries?**
**A:** Login as admin → Create Winery Account → Fill form → New owner can login

### **Q: Can winery owners edit everything?**
**A:** Yes! They have full control over:
- Profile information
- Tasting experiences & prices
- Booking slots & capacity
- Photos
- Amenities
- But they CANNOT:
  - Access other wineries
  - Access admin features
  - Delete their account

### **Q: Can I delete a winery?**
**A:** Yes, as super admin:
- Go to: `/admin/dashboard/users`
- Find winery owner
- Delete user → Associated winery is removed

### **Q: How do bookings work?**
**A:**
1. Customer books → Status: "pending"
2. Winery owner gets notification
3. Owner confirms → Status: "confirmed"
4. Customer receives confirmation email
5. Booking appears in customer's bookings

### **Q: What if a winery is fully booked?**
**A:**
- Slots automatically show as "Full"
- Customers cannot select full slots
- Winery owner can increase capacity if needed
- System prevents overbooking

---

## 🎉 **READY TO USE!**

### **Test Admin Functions Now:**
```
1. Login as admin: admin@napawineries.com / admin123
2. Go to: /admin/dashboard/create-winery
3. Create a test winery account
4. Login as new winery owner
5. Complete profile and add slots
6. Test booking flow
```

### **Test Winery Owner Functions:**
```
1. Login as owner: owner@napawineries.com / owner123
2. Go to: /winery-dashboard/profile
3. Edit winery information
4. Go to: /winery-dashboard/inventory
5. Create new booking slots
6. Go to: /winery-dashboard/bookings
7. View and manage bookings
```

---

## 📞 **NEED HELP?**

If you have questions about:
- Creating winery accounts
- Managing bookings
- Editing winery profiles
- Slot inventory
- User management

Just ask! I can guide you through any feature.

---

*Admin & Winery Dashboard Guide - December 2024*
*Complete access guide for super administrators and winery owners*
