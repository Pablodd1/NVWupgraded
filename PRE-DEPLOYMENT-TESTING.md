# 🧪 Pre-Deployment Testing Checklist

**Platform:** Napa Valley Wineries  
**Date:** 2025-12-15  
**Version:** Production Ready  
**Environment:** https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai

---

## 📋 **Test Accounts**

### **Admin Account**
```
Email: admin@napawineries.com
Password: admin123
Role: Super Administrator
Access: Full platform control
```

### **Winery Owner Account**
```
Email: owner@napawineries.com
Password: owner123
Role: Winery Owner
Winery: Opus One Winery
Access: Winery dashboard
```

### **Customer Account**
```
Email: customer@test.com
Password: customer123
Role: Customer
Access: Booking & itinerary
```

---

## ✅ **TESTING SCENARIOS**

---

## 1️⃣ **EXTERNAL BOOKING FLOW TESTING**

### **Test 1.1: External Booking Configured**
**Objective:** Verify direct booking flow works correctly

**Steps:**
1. Login as winery owner: `owner@napawineries.com` / `owner123`
2. Navigate to Winery Dashboard
3. Go to Tasting Info section
4. Set external booking link: `https://opentable.com/test`
5. Save changes
6. Open winery page in new incognito window
7. Verify hero section shows "Book Now →" button
8. Verify booking section shows blue info box
9. Verify booking section shows "Book Your Tasting Now" button
10. Click hero button → Should open external URL in new tab
11. Click booking button → Should open external URL in new tab
12. Verify toast notification appears

**Expected Results:**
- ✅ "Book Now →" appears in hero (NOT "Add to Itinerary")
- ✅ Blue information box visible
- ✅ Large booking button visible
- ✅ External link opens in new tab
- ✅ Toast notification: "Redirecting to [Winery Name]'s booking system..."
- ✅ No itinerary button visible
- ✅ No standard booking form visible

**Status:** [ ] Pass [ ] Fail

---

### **Test 1.2: External Booking NOT Configured**
**Objective:** Verify standard booking flow works when no external link

**Steps:**
1. Login as winery owner
2. Navigate to Tasting Info
3. Remove/clear external booking link
4. Save changes
5. Open winery page in new incognito window
6. Verify hero section shows "Add to Itinerary" button
7. Verify booking section shows standard form
8. Verify NO blue info box visible
9. Verify NO "Book Your Tasting Now" button

**Expected Results:**
- ✅ "Add to Itinerary" appears in hero
- ✅ Standard booking form visible (food pairing, people count)
- ✅ NO blue information box
- ✅ NO direct booking button
- ✅ Can add to itinerary successfully

**Status:** [ ] Pass [ ] Fail

---

## 2️⃣ **BUILT-IN BOOKING FLOW TESTING**

### **Test 2.1: Complete Booking Flow**
**Objective:** Verify end-to-end booking process

**Steps:**
1. Login as customer: `customer@test.com` / `customer123`
2. Browse wineries
3. Select a winery WITHOUT external booking
4. Click "Add to Itinerary"
5. Verify winery added to itinerary
6. Go to Itinerary page
7. Select date/time
8. Select food pairing (optional)
9. Select tours (optional)
10. Enter number of guests
11. Click "Confirm Booking"
12. Complete payment (if Stripe configured)
13. Verify booking confirmation

**Expected Results:**
- ✅ Winery added to itinerary successfully
- ✅ Date/time picker works
- ✅ Food pairing selection works
- ✅ Tour selection works
- ✅ Number of guests validation works
- ✅ Booking data validates correctly
- ✅ No 400 errors
- ✅ Confirmation received

**Status:** [ ] Pass [ ] Fail

---

### **Test 2.2: Booking Validation**
**Objective:** Verify validation prevents invalid bookings

**Steps:**
1. Try booking without date → Should show error
2. Try booking without time → Should show error
3. Try booking with 0 guests → Should show error
4. Try booking with invalid date (past) → Should show error
5. Try booking without login → Should prompt login

**Expected Results:**
- ✅ Date validation works
- ✅ Time validation works
- ✅ Guest count validation works
- ✅ Past date prevention works
- ✅ Authentication required

**Status:** [ ] Pass [ ] Fail

---

## 3️⃣ **ADMIN DASHBOARD TESTING**

### **Test 3.1: Admin Access**
**Objective:** Verify admin can access all features

**Steps:**
1. Login as admin: `admin@napawineries.com` / `admin123`
2. Navigate to Admin Dashboard
3. Verify access to:
   - User management
   - Winery management
   - Booking management
   - Create winery accounts
   - View all bookings
   - Platform statistics

**Expected Results:**
- ✅ Admin dashboard accessible
- ✅ Can view all users
- ✅ Can view all wineries
- ✅ Can view all bookings
- ✅ Can create winery accounts
- ✅ Statistics display correctly

**Status:** [ ] Pass [ ] Fail

---

### **Test 3.2: Create Winery Account**
**Objective:** Verify admin can create new winery accounts

**Steps:**
1. Login as admin
2. Navigate to "Create Winery Account"
3. Fill in user details:
   - First name: Test
   - Last name: Winery
   - Email: testwinery@example.com
   - Password: TestPass123
   - Phone: (555) 123-4567
4. Fill in winery details:
   - Name: Test Winery
   - Address: 123 Vineyard Lane
   - Description: Test description
5. Submit form
6. Verify account created
7. Test login with new credentials

**Expected Results:**
- ✅ Form validates correctly
- ✅ Account created successfully
- ✅ Winery profile created
- ✅ Can login with new credentials
- ✅ Winery dashboard accessible

**Status:** [ ] Pass [ ] Fail

---

## 4️⃣ **WINERY DASHBOARD TESTING**

### **Test 4.1: Profile Management**
**Objective:** Verify winery owner can manage profile

**Steps:**
1. Login as winery owner
2. Navigate to Winery Dashboard > Profile
3. Update winery name
4. Update description
5. Update contact info (phone, email, website)
6. Update opening hours
7. Save changes
8. Verify changes on public winery page

**Expected Results:**
- ✅ All fields editable
- ✅ Changes save successfully
- ✅ Changes reflect on public page immediately
- ✅ No data loss

**Status:** [ ] Pass [ ] Fail

---

### **Test 4.2: Tasting Info Management**
**Objective:** Verify tasting configuration works

**Steps:**
1. Navigate to Tasting Info
2. Add new tasting experience
3. Set tasting price: $50
4. Add wine details
5. Add food pairing: "Cheese Plate" - $15
6. Add tour: "Cellar Tour" - $25
7. Add other feature: "Private Room" - $100
8. Test with $0 prices (free items)
9. Upload tasting images
10. Set external booking link (optional)
11. Save all changes
12. Verify on winery page

**Expected Results:**
- ✅ Can add multiple tastings
- ✅ All fields work correctly
- ✅ $0 (free) prices accepted
- ✅ Images upload successfully
- ✅ External booking link saves
- ✅ All data displays on public page
- ✅ Conditional rendering works

**Status:** [ ] Pass [ ] Fail

---

### **Test 4.3: Inventory Management**
**Objective:** Verify slot inventory management

**Steps:**
1. Navigate to Inventory Management
2. Create time slots for next 30 days
3. Set capacity per slot
4. Block specific dates
5. Set pricing adjustments
6. Save changes
7. Verify slots appear on public page

**Expected Results:**
- ✅ Can create multiple slots
- ✅ Capacity limits work
- ✅ Date blocking works
- ✅ Pricing adjustments apply
- ✅ Slots visible to customers
- ✅ Real-time updates work

**Status:** [ ] Pass [ ] Fail

---

### **Test 4.4: Booking Management**
**Objective:** Verify winery can manage bookings

**Steps:**
1. Navigate to Bookings
2. View all bookings for winery
3. Filter bookings by date
4. View booking details
5. Confirm a booking
6. Decline a booking
7. Verify status updates
8. Verify email notifications sent

**Expected Results:**
- ✅ All bookings displayed
- ✅ Filtering works
- ✅ Can view details
- ✅ Can confirm bookings
- ✅ Can decline bookings
- ✅ Status updates correctly
- ✅ Notifications sent

**Status:** [ ] Pass [ ] Fail

---

## 5️⃣ **CUSTOMER EXPERIENCE TESTING**

### **Test 5.1: Registration & Login**
**Objective:** Verify authentication works

**Steps:**
1. Go to registration page
2. Create new account:
   - Email: newcustomer@test.com
   - Password: Test123!
   - First name: New
   - Last name: Customer
   - DOB: 1990-01-01
3. Submit registration
4. Logout
5. Login with new credentials
6. Verify profile accessible

**Expected Results:**
- ✅ Registration form validates
- ✅ Account created successfully
- ✅ Age verification (21+) works
- ✅ Login successful
- ✅ Profile accessible
- ✅ Session persists

**Status:** [ ] Pass [ ] Fail

---

### **Test 5.2: Winery Search & Filter**
**Objective:** Verify search and filter functionality

**Steps:**
1. Browse all wineries
2. Use search: "Opus"
3. Filter by wine type: "Cabernet"
4. Filter by price range
5. Filter by location
6. Clear filters
7. Verify results update correctly

**Expected Results:**
- ✅ Search works
- ✅ Filters apply correctly
- ✅ Results update in real-time
- ✅ Can clear filters
- ✅ No errors in console

**Status:** [ ] Pass [ ] Fail

---

### **Test 5.3: Itinerary Management**
**Objective:** Verify itinerary features work

**Steps:**
1. Add 3 wineries to itinerary
2. View itinerary page
3. Remove 1 winery
4. Clear entire itinerary
5. Add wineries again
6. Verify persistence across sessions

**Expected Results:**
- ✅ Can add multiple wineries
- ✅ Can remove individual wineries
- ✅ Can clear all
- ✅ Itinerary persists in localStorage
- ✅ Counter updates correctly

**Status:** [ ] Pass [ ] Fail

---

### **Test 5.4: Booking History**
**Objective:** Verify customer can view booking history

**Steps:**
1. Login as customer
2. Navigate to Bookings page
3. View past bookings
4. View upcoming bookings
5. View booking details
6. Verify correct information

**Expected Results:**
- ✅ All bookings displayed
- ✅ Correct dates shown
- ✅ Correct winery info
- ✅ Status displayed correctly
- ✅ Can view details

**Status:** [ ] Pass [ ] Fail

---

## 6️⃣ **PAYMENT TESTING** (If Stripe Configured)

### **Test 6.1: Stripe Checkout**
**Objective:** Verify Stripe payment flow

**Steps:**
1. Add winery to itinerary
2. Select tasting with payment
3. Proceed to checkout
4. Use test card: 4242 4242 4242 4242
5. Complete payment
6. Verify booking confirmed
7. Check Stripe dashboard for transaction

**Expected Results:**
- ✅ Checkout session created
- ✅ Stripe UI loads
- ✅ Test payment processes
- ✅ Booking confirmed
- ✅ Transaction in Stripe dashboard
- ✅ Confirmation email sent

**Status:** [ ] Pass [ ] Fail [ ] N/A (Stripe not configured)

---

## 7️⃣ **SPECIAL FEATURES TESTING**

### **Test 7.1: Voice Search & AI**
**Objective:** Verify AI-powered search works

**Steps:**
1. Use voice search feature
2. Try text search with natural language
3. Verify AI recommendations
4. Test with various queries

**Expected Results:**
- ✅ Voice input works
- ✅ AI understands queries
- ✅ Recommendations relevant
- ✅ No errors

**Status:** [ ] Pass [ ] Fail

---

### **Test 7.2: Real-Time Availability Widget**
**Objective:** Verify availability displays correctly

**Steps:**
1. Open winery page
2. View Available Slots Widget
3. Verify real-time capacity shown
4. Make a booking
5. Verify capacity decreases
6. Check for overbooking prevention

**Expected Results:**
- ✅ Widget displays correctly
- ✅ Capacity accurate
- ✅ Updates in real-time
- ✅ No overbooking possible
- ✅ Sold out slots marked

**Status:** [ ] Pass [ ] Fail

---

### **Test 7.3: Zero Price ($0) Items**
**Objective:** Verify free items work correctly

**Steps:**
1. Login as winery owner
2. Add food pairing with $0 price
3. Add tour with $0 price
4. Add feature with $0 price
5. Save changes
6. View on public page
7. Verify displays as "Free"

**Expected Results:**
- ✅ Can set $0 prices
- ✅ Saves successfully
- ✅ Displays as "Free" on page
- ✅ No validation errors
- ✅ Can book free items

**Status:** [ ] Pass [ ] Fail

---

## 8️⃣ **UI/UX TESTING**

### **Test 8.1: Conditional Rendering**
**Objective:** Verify empty sections hide correctly

**Steps:**
1. Create winery with:
   - NO tours
   - NO other features
   - NO food pairings
   - NO reviews
   - NO amenities enabled
2. View public winery page
3. Verify empty sections hidden

**Expected Results:**
- ✅ Tours section NOT visible
- ✅ Features section NOT visible
- ✅ Food pairings section NOT visible
- ✅ Reviews section NOT visible
- ✅ Amenities section NOT visible
- ✅ Page looks clean

**Status:** [ ] Pass [ ] Fail

---

### **Test 8.2: Responsive Design**
**Objective:** Verify mobile responsiveness

**Steps:**
1. Open platform on mobile device (or dev tools mobile view)
2. Test on:
   - iPhone (375px width)
   - iPad (768px width)
   - Desktop (1920px width)
3. Verify all pages responsive
4. Check navigation menu
5. Check forms
6. Check images

**Expected Results:**
- ✅ All pages responsive
- ✅ Mobile menu works
- ✅ Forms usable on mobile
- ✅ Images scale correctly
- ✅ No horizontal scrolling
- ✅ Touch targets adequate size

**Status:** [ ] Pass [ ] Fail

---

## 9️⃣ **ERROR HANDLING TESTING**

### **Test 9.1: Network Errors**
**Objective:** Verify graceful error handling

**Steps:**
1. Open developer tools
2. Simulate offline mode
3. Try various actions
4. Verify error messages
5. Restore network
6. Verify recovery

**Expected Results:**
- ✅ User-friendly error messages
- ✅ No app crashes
- ✅ Retry functionality works
- ✅ Graceful degradation

**Status:** [ ] Pass [ ] Fail

---

### **Test 9.2: Invalid Data**
**Objective:** Verify validation prevents bad data

**Steps:**
1. Try invalid email formats
2. Try weak passwords
3. Try invalid dates
4. Try negative prices
5. Try empty required fields

**Expected Results:**
- ✅ Validation catches errors
- ✅ Clear error messages
- ✅ Form doesn't submit
- ✅ Fields highlighted

**Status:** [ ] Pass [ ] Fail

---

## 🔟 **PERFORMANCE TESTING**

### **Test 10.1: Page Load Speed**
**Objective:** Verify acceptable performance

**Steps:**
1. Open Chrome DevTools > Network
2. Hard refresh homepage
3. Check load time
4. Check winery detail page load
5. Check dashboard load

**Expected Results:**
- ✅ Homepage loads < 3 seconds
- ✅ Winery page loads < 3 seconds
- ✅ Dashboard loads < 3 seconds
- ✅ Images optimized
- ✅ No blocking resources

**Status:** [ ] Pass [ ] Fail

---

## 📊 **TEST SUMMARY**

### **Critical Tests (Must Pass)**
- [ ] External booking direct flow
- [ ] Built-in booking flow
- [ ] Admin dashboard access
- [ ] Winery dashboard access
- [ ] Customer registration & login
- [ ] Conditional rendering (empty sections hide)
- [ ] Zero price items
- [ ] No 400/500 errors

### **High Priority Tests (Should Pass)**
- [ ] Create winery account
- [ ] Tasting info management
- [ ] Inventory management
- [ ] Booking management
- [ ] Search & filter
- [ ] Itinerary management
- [ ] Responsive design

### **Medium Priority Tests (Nice to Have)**
- [ ] Voice search
- [ ] Real-time availability
- [ ] Stripe payments
- [ ] Performance optimization
- [ ] Error handling

---

## ✅ **TESTING COMPLETION**

**Date Completed:** _______________  
**Tester Name:** _______________  
**Total Tests:** 30+  
**Tests Passed:** _____ / _____  
**Tests Failed:** _____ / _____  
**Critical Issues:** _______________  

### **Sign-Off**
- [ ] All critical tests passed
- [ ] No blocking issues
- [ ] Ready for production deployment

**Approved By:** _______________  
**Date:** _______________

---

## 🚀 **NEXT STEPS AFTER TESTING**

1. **If All Tests Pass:**
   - Proceed to Vercel deployment
   - Follow VERCEL-DEPLOYMENT-CHECKLIST.md
   - Set up production environment variables

2. **If Tests Fail:**
   - Document all failures
   - Fix critical issues first
   - Re-test failed scenarios
   - Repeat until all pass

3. **Post-Deployment:**
   - Run smoke tests on production
   - Monitor error logs
   - Set up analytics
   - Create PR to main branch

---

**Platform:** Napa Valley Wineries  
**Version:** 1.0.0 Production  
**Status:** Ready for Testing ✅
