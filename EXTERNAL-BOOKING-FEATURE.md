# External Booking Feature - Complete Guide

## 🎯 Overview

The Napa Valley Wineries Platform now supports **External Booking Links**, allowing winery owners to direct customers to their own private booking systems instead of using the built-in booking flow.

This feature is **100% conditional** - it only appears on the winery landing page IF the winery owner has configured it in their dashboard.

---

## ✅ Feature Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| Database Schema | ✅ Implemented | `src/models/winery.model.ts` (Line 43) |
| Winery Dashboard UI | ✅ Implemented | `src/components/winery-stepper/tasting-booking-step.tsx` (Lines 513-522) |
| Winery Landing Page Button | ✅ Implemented | `src/app/winery/[id]/page.tsx` (Lines 404-414) |
| Conditional Rendering | ✅ Implemented | All empty sections auto-hide |

---

## 📋 How It Works

### For Winery Owners (Admin Dashboard)

#### Option 1: Per-Tasting External Booking Link
1. **Login** to winery dashboard: `owner@napawineries.com` / `owner123`
2. Navigate to **Winery Profile > Tasting Info**
3. For each tasting, find the **"External Booking Link (Optional)"** field
4. Enter your external booking URL (e.g., `https://my-winery-booking.com/reserve`)
5. **Save Changes**

#### Option 2: Winery-Level External Booking (Global)
1. **Login** to winery dashboard
2. Navigate to **Winery Profile > Payment Method**
3. Select **"External Booking Link"** radio button
4. Enter your external booking URL
5. **Save Changes**

**Code Reference:**
```tsx
// src/components/winery-stepper/tasting-booking-step.tsx (Lines 513-522)
<div className="form-control">
  <label className="label">External Booking Link (Optional)</label>
  <input
    type="url"
    placeholder="Enter booking link (e.g., https://winery.com/book)"
    className="input input-bordered"
    value={tasting.booking_info.external_booking_link || ""}
    onChange={handleExternalBookingLinkChange(index)}
  />
</div>
```

---

### For Customers (Winery Landing Page)

#### Scenario 1: External Booking Link Configured ✅
- Customer visits winery page: `https://your-app.com/winery/[id]`
- Scrolls to **"Book a Tasting"** section
- Sees prominent **"Book via External Site"** button
- Clicks button → Opens winery's private booking system in new tab

**What Customers See:**
```
┌─────────────────────────────────────┐
│      Book a Tasting                 │
├─────────────────────────────────────┤
│ Select Food Pairing (Optional)      │
│ [Dropdown Menu]                     │
│                                     │
│ Number of People                    │
│ [Input Field]                       │
│                                     │
│ ┌───────────────────────────────┐  │
│ │  Book via External Site  →   │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Code Reference:**
```tsx
// src/app/winery/[id]/page.tsx (Lines 404-414)
{/* External Booking Link */}
{currentTastingInfo?.booking_info?.external_booking_link && (
  <div>
    <Button
      className="bg-wine-primary hover:bg-wine-primary/90 text-white w-full py-6 text-lg"
      onClick={() => window.open(currentTastingInfo.booking_info.external_booking_link, "_blank")}
    >
      Book via External Site
    </Button>
  </div>
)}
```

#### Scenario 2: NO External Booking Link ❌
- External booking button **does NOT appear**
- Customer uses built-in NVW booking system
- Standard booking flow with Stripe payments or pay-at-winery

---

## 🎨 Conditional Rendering - Smart UI

The platform intelligently hides empty sections to keep the winery landing page clean and professional.

### Sections That Auto-Hide When Empty:

| Section | Condition | Code Location |
|---------|-----------|---------------|
| **Tasting Details** | Only shows if ANY of: wines, tours, features, or food pairings exist | `page.tsx` Lines 236-322 |
| **Tours** | Only shows if `tours.tour_options.length > 0` | `page.tsx` Lines 271-285 |
| **Other Features** | Only shows if `other_features.length > 0` | `page.tsx` Lines 288-302 |
| **Food Pairings** | Only shows if `food_pairing_options.length > 0` | `page.tsx` Lines 305-319 |
| **Amenities** | Only shows if ANY amenity is enabled | `page.tsx` Lines 421-445 |
| **Reviews** | Only shows if `user_reviews.length > 0` | `page.tsx` Lines 447-473 |
| **Transportation** | Only shows if Uber OR Lyft is available | Conditional logic |

**Example Code:**
```tsx
// Only show "Tasting Details" section if there's actual content
{(currentTastingInfo?.wine_details?.length > 0 || 
  currentTastingInfo?.tours?.tour_options?.length > 0 || 
  currentTastingInfo?.other_features?.length > 0 || 
  currentTastingInfo?.food_pairing_options?.length > 0) && (
  <div className="bg-white rounded-lg p-8 shadow-lg">
    <h2 className="font-serif text-3xl mb-6 text-wine-primary">Tasting Details</h2>
    {/* Content */}
  </div>
)}
```

---

## 🗄️ Database Schema

### External Booking Link Field
```typescript
// src/models/winery.model.ts (Line 43)
const BookingInfoSchema = new mongoose.Schema({
  booking_enabled: { type: Boolean, default: false },
  max_guests_per_slot: { type: Number, min: 0 },
  number_of_people: [{ type: Number, min: 0 }],
  dynamic_pricing: {
    enabled: { type: Boolean, default: false },
    weekend_multiplier: { type: Number, min: 0 },
  },
  available_slots: [{ type: String }],
  external_booking_link: { type: String }, // ← THIS FIELD
});
```

---

## 🧪 Testing Guide

### Test Case 1: Set External Booking Link
**Steps:**
1. Login as winery owner: `owner@napawineries.com` / `owner123`
2. Navigate to winery dashboard
3. Go to tasting info section
4. Enter external booking link: `https://example.com/book`
5. Save changes

**Expected Result:**
- Link saved successfully
- Toast notification: "Changes saved"

---

### Test Case 2: Verify Button on Landing Page
**Steps:**
1. Open winery page: `https://your-app.com/winery/[winery-id]`
2. Scroll to "Book a Tasting" section
3. Look for "Book via External Site" button

**Expected Result:**
- Button is visible
- Button has wine-primary background color
- Click opens external URL in new tab

---

### Test Case 3: No External Link (Default Behavior)
**Steps:**
1. Create new winery WITHOUT external booking link
2. Visit winery landing page
3. Scroll to "Book a Tasting" section

**Expected Result:**
- NO "Book via External Site" button
- Standard booking UI visible (food pairings, number of people, etc.)
- Built-in booking flow available

---

### Test Case 4: Empty Sections Hidden
**Steps:**
1. Create winery with:
   - NO tours
   - NO other features
   - NO food pairings
   - NO reviews
2. Visit winery landing page

**Expected Result:**
- "Tours" section **NOT visible**
- "Other Features" section **NOT visible**
- "Food Pairings" section **NOT visible**
- "Reviews" section **NOT visible**
- Page looks clean and professional

---

## 🚀 Live Testing

### Test Accounts
```
Admin Account:
Email: admin@napawineries.com
Password: admin123

Winery Owner Account:
Email: owner@napawineries.com
Password: owner123
Winery: Opus One Winery

Customer Account:
Email: customer@test.com
Password: customer123
```

### Dev Platform URL
```
https://3001-iqhg9dwtlwmxpv2t0wdw2-5185f4aa.sandbox.novita.ai
```

---

## 🔧 Customization Options

### Button Styling
The external booking button uses your brand colors:
```tsx
className="bg-wine-primary hover:bg-wine-primary/90 text-white w-full py-6 text-lg"
```

**To Customize:**
1. Edit `/src/app/winery/[id]/page.tsx` (Line 408)
2. Modify `className` prop
3. Example custom colors:
   ```tsx
   className="bg-blue-600 hover:bg-blue-700 text-white w-full py-6 text-lg"
   ```

---

### Button Text
Default text: **"Book via External Site"**

**To Customize:**
1. Edit `/src/app/winery/[id]/page.tsx` (Line 411)
2. Change button text:
   ```tsx
   <Button onClick={...}>
     Reserve Your Tasting Now  {/* Custom text */}
   </Button>
   ```

---

## 📊 Feature Benefits

### For Winery Owners
✅ **Flexibility**: Use your existing booking system  
✅ **Control**: Keep customer data in your own system  
✅ **Branding**: Maintain consistent booking experience  
✅ **No Migration**: No need to move to new platform  

### For Platform Operators
✅ **Scalability**: Support wineries with any booking system  
✅ **Adoption**: Lower barrier to entry for new wineries  
✅ **Options**: Built-in booking OR external - winery chooses  

### For Customers
✅ **Seamless**: One-click redirect to booking  
✅ **Trust**: Book through winery's official system  
✅ **Familiar**: May recognize winery's existing platform  

---

## 🐛 Troubleshooting

### Issue: External Booking Button Not Appearing
**Solutions:**
1. ✅ Verify `external_booking_link` is set in database
2. ✅ Check browser console for errors
3. ✅ Confirm link is non-empty string
4. ✅ Clear browser cache and reload

**Debug Code:**
```tsx
// Add to page.tsx to debug
console.log("External Booking Link:", currentTastingInfo?.booking_info?.external_booking_link);
```

---

### Issue: Link Opens in Same Tab
**Solution:**
Verify `window.open` uses `"_blank"` parameter:
```tsx
onClick={() => window.open(link, "_blank")}  // ← "_blank" is critical
```

---

### Issue: Empty Sections Still Showing
**Solution:**
Check conditional rendering logic:
```tsx
// CORRECT ✅
{items?.length > 0 && <Section />}

// WRONG ❌
{items && <Section />}  // Still shows if items = []
```

---

## 📝 Summary

| Feature | Status |
|---------|--------|
| External booking link field in database | ✅ Working |
| Dashboard UI for setting link | ✅ Working |
| Conditional button on landing page | ✅ Working |
| Opens in new tab | ✅ Working |
| Smart section hiding | ✅ Working |
| Free ($0) pricing support | ✅ Working |
| Stripe payment integration | ✅ Working |
| Deployment documentation | ✅ Complete |

---

## 🎓 Developer Notes

### Architecture
- **Model**: `external_booking_link` stored in `booking_info` subdocument
- **Dashboard**: Winery owners manage via admin panel
- **Frontend**: React conditional rendering (`&&` operator)
- **Behavior**: Opens external URL in new browser tab/window

### Future Enhancements
- [ ] Track external booking click analytics
- [ ] Add custom button text per winery
- [ ] Support booking system integrations (API callbacks)
- [ ] Add booking confirmation webhooks

---

## 📞 Support

Need help with external booking setup?

**Documentation:** `/home/user/webapp/EXTERNAL-BOOKING-FEATURE.md`  
**Test Accounts:** See `TEST-ACCOUNTS.md`  
**Deployment:** See `VERCEL-DEPLOYMENT-CHECKLIST.md`  
**GitHub:** https://github.com/Pablodd1/NVWineries-dec

---

## ✅ Status: PRODUCTION READY

✅ All code implemented  
✅ All tests passing  
✅ Documentation complete  
✅ Ready for deployment  

**Last Updated:** 2025-12-14  
**Version:** 1.0.0  
**Status:** Production Ready 🚀
