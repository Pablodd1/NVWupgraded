# 🔐 Test Accounts for Napa Valley Wineries Platform

## 📋 Overview

This document contains all test accounts for the Napa Valley Wineries wine tourism platform. Use these credentials to test different user roles and features.

---

## 👨‍💼 **ADMIN ACCOUNT**

### **Credentials:**
```
Email:    admin@napawineries.com
Password: admin123
Role:     admin
```

### **What You Can Do:**
- ✅ Access Admin Dashboard (`/admin/dashboard`)
- ✅ Create new winery accounts
- ✅ Manage all users (view, edit, delete)
- ✅ Reset user passwords
- ✅ View all bookings across all wineries
- ✅ Confirm or cancel any booking
- ✅ View platform statistics
- ✅ Full platform access

### **Test Workflows:**
1. **Create Winery Account:**
   - Login as admin
   - Go to `/admin/dashboard/create-winery`
   - Fill in winery and owner details
   - Create new winery + owner account
   
2. **Manage Users:**
   - Go to `/admin/dashboard/users`
   - Filter by role (customer, winery, admin)
   - View user details
   - Reset passwords if needed

3. **View All Bookings:**
   - Go to `/admin/dashboard`
   - See all bookings across all wineries
   - Confirm or cancel bookings

---

## 🍷 **WINERY OWNER ACCOUNT**

### **Credentials:**
```
Email:    owner@napawineries.com
Password: owner123
Role:     winery
Winery:   Opus One Winery
```

### **What You Can Do:**
- ✅ Access Winery Dashboard (`/winery-dashboard`)
- ✅ Manage winery profile (name, description, contact)
- ✅ Create and manage booking time slots
- ✅ Set capacity for each time slot
- ✅ Block/unblock specific dates
- ✅ View incoming bookings for your winery
- ✅ Confirm or decline booking requests
- ✅ Receive email notifications for new bookings
- ✅ View statistics (today's bookings, pending, capacity)

### **Test Workflows:**
1. **Manage Winery Profile:**
   - Login as winery owner
   - Go to `/winery-dashboard/profile`
   - Update winery information
   - Set opening hours
   - Update contact details

2. **Manage Inventory/Slots:**
   - Go to `/winery-dashboard/inventory`
   - View existing slots with real dates
   - Add new time slots (date, time, capacity)
   - Update capacity for existing slots
   - Block/unblock specific dates

3. **Manage Bookings:**
   - Go to `/winery-dashboard/bookings`
   - See all bookings for your winery
   - Filter by status (pending, confirmed, cancelled)
   - Confirm or decline booking requests
   - View booking details (customer info, date, time, activities)

---

## 👤 **CUSTOMER ACCOUNT 1**

### **Credentials:**
```
Email:    customer@test.com
Password: customer123
Role:     customer
DOB:      1990-01-01 (Age: 34)
```

### **What You Can Do:**
- ✅ Browse all wineries
- ✅ Use voice search & AI recommendations
- ✅ Add wineries to itinerary
- ✅ Select dates and times for bookings
- ✅ Choose food pairings and tours
- ✅ Complete bookings with Stripe or pay at winery
- ✅ Receive booking confirmation emails
- ✅ View booking history
- ✅ Manage profile

### **Test Workflows:**
1. **Browse & Search:**
   - Login as customer
   - Browse wineries on homepage
   - Use voice search: "Show me cabernet under $50"
   - See AI recommendations

2. **Create Booking:**
   - Add winery to itinerary
   - Go to `/itinerary`
   - Select date and time
   - Choose food pairing (optional)
   - Select tour (optional)
   - Confirm booking
   - Choose payment method (Stripe or pay at winery)
   - Receive email confirmation

3. **View Bookings:**
   - Go to `/bookings`
   - See all your bookings
   - View booking details
   - Cancel if needed

---

## 👤 **CUSTOMER ACCOUNT 2**

### **Credentials:**
```
Email:    john@example.com
Password: john123
Role:     customer
DOB:      1985-06-15 (Age: 39)
```

### **What You Can Do:**
- Same as Customer Account 1
- Use this for testing multiple users booking same slots
- Test real-time capacity deduction

### **Test Workflows:**
1. **Test Slot Availability:**
   - Login as customer@test.com
   - Book a specific slot (e.g., Opus One, Dec 15, Morning)
   - Logout
   - Login as john@example.com
   - View same winery - see reduced capacity
   - Try to book same slot - see updated availability

2. **Test Concurrent Bookings:**
   - Open two browser windows
   - Login as different customers
   - Try to book same slot simultaneously
   - Verify inventory system prevents overbooking

---

## 🧪 **Testing Scenarios**

### **1. Test Signup Process**
```
Steps:
1. Logout (if logged in)
2. Click "Sign Up"
3. Fill all fields:
   - First Name: Your Name
   - Last Name: Your Lastname
   - Date of Birth: Must be 21+ (e.g., 01/01/1995)
   - Email: your@email.com
   - Phone: 5555555555
   - Password: yourpassword123
4. Click "Create Account"
5. Should auto-login and redirect to homepage
```

**Common Errors:**
- ❌ "You must be 21 years or older" → Check DOB (need to be born before 2003)
- ❌ "Email already in use" → Try different email
- ❌ "Phone number already in use" → Try different phone
- ❌ "All fields are required" → Check all fields filled

### **2. Test Slot Availability Widget**
```
Steps:
1. Go to any winery page (e.g., /winery/693d9b69a3797ebfeab5f8f3)
2. See "Available Now" widget at top
3. Verify shows:
   - Earliest available slot (highlighted green)
   - Today's availability (time-aware, past slots hidden)
   - Next 7 days calendar (compact view)
   - Click to expand - see detailed breakdown
4. Wait 5 minutes - watch auto-refresh
```

### **3. Test Admin Creating Winery Account**
```
Steps:
1. Login as admin@napawineries.com / admin123
2. Go to /admin/dashboard/create-winery
3. Fill in Winery Information:
   - Name: Test Winery
   - Address: 123 Main St, Napa, CA
   - Phone: 707-555-1234
   - Email: test@winery.com
   - Website: https://testwinery.com
   - Description: A test winery
4. Fill in Owner Information:
   - First Name: Test
   - Last Name: Owner
   - Email: testowner@example.com
   - Password: test123
5. Click "Create Winery & Owner Account"
6. Verify success message
7. Logout
8. Login as testowner@example.com / test123
9. Should redirect to Winery Dashboard
10. See the new winery (Test Winery)
```

### **4. Test Real-Time Inventory Deduction**
```
Steps:
1. Note: Open winery page (e.g., Opus One)
2. Check "Available Now" widget
3. See specific slot capacity (e.g., "8 spots left")
4. Login as customer
5. Book that slot for 2 people
6. Complete booking
7. Refresh winery page
8. Check same slot - should show "6 spots left"
9. Try booking with 7 people - should fail (not enough capacity)
```

### **5. Test Time-Aware Slot Display**
```
Steps:
1. Go to winery page in the morning (e.g., 9 AM)
2. See "Today's Availability"
3. All time slots visible (Morning, Afternoon, Evening)
4. Come back at 2 PM
5. Morning slot should be hidden
6. Only Afternoon and Evening visible
7. Come back at 5 PM
8. Only Evening visible
9. Come back next day
10. "Today" updates to new date
11. All slots visible again for new day
```

---

## 📞 **Support Information**

### **If You Encounter Issues:**

**Signup Not Working:**
- Check all fields are filled correctly
- Verify age is 21+ (DOB before 2003)
- Try different email/phone if "already in use"
- Check console for detailed error messages

**Login Not Working:**
- Verify credentials are correct (case-sensitive)
- Clear browser cookies
- Try incognito/private window

**Winery Dashboard Not Loading:**
- Verify logged in as winery owner (not customer)
- Check winery is associated with account
- Try logging out and back in

**Slots Not Showing:**
- Verify slots were seeded (`npm run seed:slots`)
- Check MongoDB is running
- Refresh page
- Wait for auto-refresh (5 minutes)

### **MongoDB Reset (If Needed):**
```bash
# Re-seed wineries
npm run seed

# Re-seed slots
npm run seed:slots

# Re-create test accounts
npm run create:accounts
```

---

## 🔄 **Account Management**

### **Creating More Test Accounts:**

**Via Signup Form:**
- Any user can create customer account
- Use different email/phone for each

**Via Admin Dashboard:**
- Login as admin
- Go to "Create Winery Account"
- Creates winery + owner in one step

**Via Script:**
- Edit `scripts/create-test-accounts.ts`
- Add more accounts
- Run `npm run create:accounts`

### **Resetting Passwords:**

**As Admin:**
- Login to admin dashboard
- Go to "User Management"
- Find user
- Click "Reset Password"
- Enter new password

**As User:**
- Currently: Contact admin
- Future: Self-service password reset

---

## ✅ **Quick Reference**

| Account Type | Email | Password | Access |
|-------------|-------|----------|--------|
| **Admin** | admin@napawineries.com | admin123 | Full platform |
| **Winery Owner** | owner@napawineries.com | owner123 | Opus One Dashboard |
| **Customer 1** | customer@test.com | customer123 | Browse & Book |
| **Customer 2** | john@example.com | john123 | Browse & Book |

---

## 🚀 **Ready to Test!**

All accounts are ready. Start testing the platform:

1. **Test signup:** Create your own account
2. **Test customer flow:** Login as customer → Browse → Book
3. **Test winery flow:** Login as owner → Manage slots → Confirm bookings
4. **Test admin flow:** Login as admin → Create winery → Manage users

**Platform URL:** https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai

---

*Last Updated: December 2024*
