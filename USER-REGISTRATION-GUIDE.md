# 🔐 User Registration & Account Types Guide

## 📋 Overview

The Napa Valley Wineries platform has **3 user types**, each with different registration processes and capabilities:

---

## 1. 👤 **Customer / Guest User** (Default)

### How to Sign Up:
1. Go to the homepage
2. Click **"Sign Up"** button (top right)
3. Fill in the registration form:
   - ✅ First Name
   - ✅ Last Name
   - ✅ Date of Birth (must be 21+)
   - ✅ Email
   - ✅ Phone Number
   - ✅ Password
4. Click **"Create Account"**

### What You Can Do:
- ✅ Browse all wineries
- ✅ Use voice search & AI recommendations
- ✅ Add wineries to itinerary
- ✅ Book wine tastings
- ✅ Select dates, times, food pairings, tours
- ✅ Pay with Stripe or at winery
- ✅ Receive booking confirmations via email/SMS
- ✅ View your booking history

### Access:
- Main website pages
- Itinerary and booking pages
- Profile management

---

## 2. 🍷 **Winery Owner** (Business Account)

### How to Get a Winery Account:
**⚠️ Winery accounts can ONLY be created by administrators**

You need to contact an administrator who will create your account through the Admin Dashboard.

### Registration Process (Done by Admin):
1. Admin logs into Admin Dashboard
2. Goes to **"Create Winery Account"** page
3. Fills in:
   - **Winery Information:**
     - Winery Name
     - Address
     - Phone, Email, Website
     - Description
   - **Owner Information:**
     - First Name
     - Last Name
     - Email (for login)
     - Password (temporary - should be changed)
4. Admin clicks **"Create Winery & Owner Account"**
5. System creates:
   - ✅ New Winery entry in database
   - ✅ New User account with `role: 'winery'`
   - ✅ Links owner to winery

### Login Credentials:
- **Email:** The email provided by admin
- **Password:** The password set by admin (change it after first login!)

### What You Can Do (Winery Dashboard):
- ✅ Manage winery profile (name, description, contact info)
- ✅ Set up tasting experiences (prices, wine types, descriptions)
- ✅ Create and manage booking time slots
- ✅ Set capacity for each time slot
- ✅ Block/unblock dates
- ✅ View incoming bookings
- ✅ Confirm or decline booking requests
- ✅ Receive email notifications for new bookings
- ✅ View booking statistics (today's bookings, pending, capacity)

### Access:
- Winery Dashboard: `/winery-dashboard`
- Profile Management: `/winery-dashboard/profile`
- Slot Inventory: `/winery-dashboard/inventory`
- Bookings: `/winery-dashboard/bookings`

---

## 3. 👨‍💼 **Administrator** (Admin Account)

### How to Get Admin Account:
**⚠️ Admin accounts are created directly in the database or by existing admins**

There is no public signup for admin accounts (security measure).

### Current Test Admin Account:
```
Email: admin@napawineries.com
Password: admin123
```

### What You Can Do (Admin Dashboard):
- ✅ Create new winery accounts (with owner credentials)
- ✅ Manage all users (customers, winery owners)
- ✅ View and filter users by role
- ✅ Reset user passwords
- ✅ View all bookings across all wineries
- ✅ Confirm or cancel any booking
- ✅ View detailed booking information
- ✅ Access to all platform statistics
- ✅ Receive email notifications for all bookings

### Access:
- Admin Dashboard: `/admin/dashboard`
- User Management: `/admin/dashboard/users`
- Create Winery: `/admin/dashboard/create-winery`
- Winery List: `/admin/dashboard/winery/list`
- All Bookings: `/admin/dashboard/bookings`

---

## 🔄 User Type Comparison

| Feature | Customer | Winery Owner | Administrator |
|---------|----------|--------------|---------------|
| **Browse Wineries** | ✅ | ✅ | ✅ |
| **Book Tastings** | ✅ | ❌ | ✅ |
| **Manage Own Winery** | ❌ | ✅ | ❌ |
| **Create Winery Accounts** | ❌ | ❌ | ✅ |
| **Manage All Users** | ❌ | ❌ | ✅ |
| **View All Bookings** | Own only | Own winery | All |
| **Email Notifications** | Bookings | Bookings | All |

---

## 📝 Step-by-Step: Getting a Winery Account

### For Winery Owners:

**Step 1: Contact Administrator**
- Email: admin@napawineries.com
- Provide your winery information:
  - Winery name
  - Full address
  - Contact details (phone, email, website)
  - Brief description
  - Your name (as owner)
  - Desired login email

**Step 2: Wait for Account Creation**
- Admin will create your winery and owner account
- You'll receive an email with login credentials

**Step 3: First Login**
1. Go to homepage
2. Click **"Login"**
3. Enter your email and temporary password
4. You'll be redirected to Winery Dashboard
5. **Important:** Go to profile and change your password!

**Step 4: Set Up Your Winery**
1. Complete winery profile information
2. Create booking time slots:
   - Select dates
   - Choose time slots (Morning, Afternoon, Evening)
   - Set capacity (how many guests per slot)
3. Configure tasting experiences:
   - Tasting name and description
   - Price per person
   - Wine types offered
   - Food pairing options
   - Tour options

**Step 5: Start Accepting Bookings!**
- Monitor dashboard for new bookings
- Receive email notifications
- Confirm or decline booking requests
- Manage your availability

---

## 🧪 Test Accounts (For Testing)

### Admin Account:
```
Email: admin@napawineries.com
Password: admin123
Role: admin
```

### Winery Owner Account:
```
Email: owner@napawineries.com
Password: owner123
Role: winery
Winery: Opus One Winery
```

### Customer Account:
Create your own via the "Sign Up" button!

---

## 🔒 Security Notes

1. **Password Security:**
   - Always use strong passwords
   - Change temporary passwords immediately
   - Never share your credentials

2. **Role-Based Access:**
   - Each user type has specific permissions
   - You can only access features for your role
   - Attempting to access unauthorized areas will redirect you

3. **Data Privacy:**
   - Winery owners can only see their own winery data
   - Customers can only see their own bookings
   - Admins have full access (for support purposes)

---

## 📞 Need Help?

### For Customers:
- Email: support@napawineries.com
- Visit: `/support` page

### For Winery Owners:
- Email: admin@napawineries.com
- Subject: "Winery Account Request"

### For Technical Issues:
- Create an issue on GitHub
- Contact system administrator

---

## 🚀 Quick Start Guide

### I Want To:

**"Book a wine tasting"**
→ Sign up as Customer → Browse wineries → Add to itinerary → Confirm booking

**"List my winery"**
→ Contact admin → Receive credentials → Login → Set up winery profile → Create time slots

**"Manage the platform"**
→ Use admin credentials → Access admin dashboard → Manage users & wineries

---

## ✅ Available Time Slots

After running the slot seeding script, all wineries now have:
- **90 days** of available dates (from today)
- **3 time slots per day:**
  - Morning (10:00 AM - 12:00 PM)
  - Afternoon (1:00 PM - 3:00 PM)
  - Evening (4:00 PM - 6:00 PM)
- **4-12 guests** capacity per slot (randomly assigned)
- **450 bookable slots** per winery
- **1,620 total slots** across all 6 wineries

---

## 🔄 Updating Slot Availability

### For Winery Owners:
1. Login to Winery Dashboard
2. Go to **"Inventory Management"**
3. You can:
   - Add new time slots
   - Update capacity for existing slots
   - Block/unblock specific dates
   - View current bookings per slot

### For Administrators:
- Run `npm run seed:slots` to regenerate all slots (will clear existing!)
- This is useful for testing or resetting the system

---

*Last Updated: December 2024*
