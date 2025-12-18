# ✅ Quick Testing Checklist (15 Minutes)

**Platform:** https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai

---

## 🚀 **CRITICAL TESTS (Must Pass Before Deploy)**

### ✅ **Test 1: External Booking Direct Flow** (3 min)
1. Login: `owner@napawineries.com` / `owner123`
2. Set external booking link: `https://example.com/book`
3. Save
4. Open winery page (logout first)
5. ✅ Verify "Book Now →" button in hero
6. ✅ Verify blue info box in booking section
7. ✅ Click button → Opens external URL
8. ✅ No "Add to Itinerary" visible

**Status:** [ ] PASS [ ] FAIL

---

### ✅ **Test 2: Built-in Booking Flow** (3 min)
1. Remove external booking link
2. Save
3. Open winery page
4. ✅ Verify "Add to Itinerary" button in hero
5. ✅ Verify standard booking form
6. ✅ Add to itinerary works
7. ✅ Go to itinerary page
8. ✅ Select date, time, guests
9. ✅ No 400 errors

**Status:** [ ] PASS [ ] FAIL

---

### ✅ **Test 3: Admin Dashboard** (2 min)
1. Login: `admin@napawineries.com` / `admin123`
2. ✅ Dashboard loads
3. ✅ Can view wineries
4. ✅ Can view bookings
5. ✅ Can access create winery

**Status:** [ ] PASS [ ] FAIL

---

### ✅ **Test 4: Winery Dashboard** (2 min)
1. Login: `owner@napawineries.com` / `owner123`
2. ✅ Dashboard loads
3. ✅ Can edit profile
4. ✅ Can edit tasting info
5. ✅ Can add $0 price items

**Status:** [ ] PASS [ ] FAIL

---

### ✅ **Test 5: Zero Price Items** (2 min)
1. Login as winery owner
2. Add food pairing: "Free Tasting" - $0
3. Save
4. View winery page
5. ✅ Shows as "Free" not "$0.00"

**Status:** [ ] PASS [ ] FAIL

---

### ✅ **Test 6: Conditional Rendering** (2 min)
1. Create winery with NO extras
2. View winery page
3. ✅ Empty sections hidden
4. ✅ Only filled sections show

**Status:** [ ] PASS [ ] FAIL

---

### ✅ **Test 7: Mobile Responsive** (1 min)
1. Open dev tools → Mobile view (375px)
2. ✅ Homepage responsive
3. ✅ Winery page responsive
4. ✅ Forms usable
5. ✅ No horizontal scroll

**Status:** [ ] PASS [ ] FAIL

---

## 📊 **RESULTS**

**Tests Passed:** ____ / 7  
**Tests Failed:** ____ / 7

### **Decision:**
- [ ] ALL PASS → Deploy to Vercel ✅
- [ ] ANY FAIL → Fix issues first ⚠️

---

**Tested By:** _______________  
**Date:** _______________  
**Time:** _______________
