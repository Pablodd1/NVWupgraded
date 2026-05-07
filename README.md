# Napa Valley Wineries (NVW) Platform

🚀 **Live at:** https://napa-one.vercel.app  
📦 **Repo:** https://github.com/Pablodd1/NVWupgraded  
🌿 **Branch:** `master`  
📅 **Last Hardened:** May 7, 2026

---

## Features

- **AI Concierge**: Natural language itinerary planning powered by Gemini.
- **Infinite Scroll**: Optimized winery card listing with lazy loading.
- **Secure Booking**: Atomic slot reservation via `findOneAndUpdate` (no race conditions).
- **Role-Based Access**: Customer / Winery Owner / Admin dashboards.
- **Image Upload**: Winery photos via ImgBB CDN — no local storage.
- **Transactional Email**: Resend (booking confirmations, declines, reminders).

---

## Production Environment Variables

> ⚠️ **These MUST be set in Vercel → Project Settings → Environment Variables.**

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | 🔴 Yes | Atlas connection string (`napa-valley-wineries` DB) |
| `JWT_SECRET` | 🔴 Yes | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `RESEND_API_KEY` | 🔴 Yes | From [resend.com/api-keys](https://resend.com/api-keys) |
| `EMAIL_FROM` | 🔴 Yes | `notifications@napawineries.com` (must be verified in Resend) |
| `IMGBB_API_KEY` | 🔴 Yes | From [imgbb.com](https://imgbb.com) — **no fallback in code, must be set** |
| `NEXT_PUBLIC_APP_URL` | 🔴 Yes | `https://napa-one.vercel.app` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 🟡 Recommended | Maps + Places + Geocoding APIs enabled |
| `STRIPE_SECRET_KEY` | 🟡 For payments | `sk_live_...` from Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 🟡 For payments | `pk_live_...` from Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | 🟡 For payments | From Stripe webhook endpoint config |
| `ADMIN_EMAIL` | 🟡 Recommended | `admin@napawineries.com` for error alerts |
| `IMGBB_API_KEY` | 🔴 Yes | Winery image upload (no hardcoded fallback) |

---

## Getting Started (Local Dev)

```bash
npm install
cp env.template .env.local   # Fill in your dev keys
npm run dev                   # http://localhost:3000
```

---

## Architecture

### Image Upload Flow
```
User selects file → profile/page.tsx handleImageUpload()
  → POST /api/upload (5MB guard, type check)
  → ImgBB API (IMGBB_API_KEY env var only)
  → Returns CDN URL → saved to MongoDB via PUT /api/winery-dashboard/profile
```

### Booking Flow (Atomic)
```
Customer → POST /api/itinerary/book
  → findOneAndUpdate with $inc on SlotInventory (prevents overbooking)
  → Stripe checkout session created
  → Winery notified via Resend
  → Winery confirms/declines → Customer emailed final decision
```

---

## API Reference

### `GET /api/winery`
- **Pagination:** `?page=1&limit=20`
- **Response:** `{ wineries: Winery[], total, page, pages }`

### `POST /api/upload`
- **Body:** `FormData` with `file` field (image only, max 5MB)
- **Returns:** `{ url: "https://i.ibb.co/..." }`
- **Requires:** `IMGBB_API_KEY` env var

---

## Smoke Test Results — May 7, 2026

| Flow | Status |
|------|--------|
| Homepage + winery listings | ✅ PASS |
| Winery detail page | ✅ PASS |
| Winery owner login (`owner@napawineries.com`) | ✅ PASS |
| Winery dashboard stats | ✅ PASS |
| Winery profile — Operating Hours section | ✅ PASS |
| Image upload section UI | ✅ PASS |
| Customer registration | ✅ PASS |
| Add winery to itinerary | ✅ PASS |

---

## Hardening Changelog

| Date | Change | File |
|------|--------|------|
| Apr 23, 2026 | Purged mockInventory from winery slots API | `api/winery-dashboard/slots/route.ts` |
| Apr 23, 2026 | Added `operating_hours` to Winery interface | `app/interfaces.ts` |
| Apr 23, 2026 | Fixed `weekday: 'lowercase'` invalid locale | `lib/slotGenerator.ts` |
| Apr 23, 2026 | Commented out undefined `sendSMS` calls | `lib/notifications.ts` |
| May 7, 2026 | Removed 3x duplicate `DayHours/OperatingHours` interfaces | `app/interfaces.ts` |
| May 7, 2026 | **Removed hardcoded ImgBB API key fallback** | `api/upload/route.ts` |
| May 7, 2026 | Added 5MB file size guard to upload API | `api/upload/route.ts` |
| May 7, 2026 | Switched `catch (error: any)` → `catch (error: unknown)` | `api/upload/route.ts` |

---

## Deployment

Deployed via **Vercel** on push to `master`. Build command: `npm run build`.

### What you need to provide (one-time setup)
1. ✅ `IMGBB_API_KEY` — add to Vercel env vars (remove localhost restriction if any)
2. ✅ `NEXT_PUBLIC_APP_URL=https://napa-one.vercel.app` — confirm this is set in Vercel
3. ✅ `JWT_SECRET` — regenerate a strong 64-char hex and update in Vercel
4. 🔴 `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — add real live keys when ready for payments
5. ✅ Verify `EMAIL_FROM` domain (`napawineries.com`) is authenticated in your Resend dashboard

---

## Screenshots & Recordings

All saved locally at:
```
C:\Users\Owner\.gemini\antigravity\brain\7d32df3a-d49f-44fd-8fc6-60282904299c\
```

Key files:
| File | Shows |
|------|-------|
| `smoke_test_nvw_production_1778155186928.webp` | Full smoke test recording |
| `smoke_05_dashboard_...png` | Winery Dashboard |
| `smoke_06_operating_hours_...png` | Operating Hours (fixed section) |
| `smoke_09_itinerary_...png` | Customer itinerary flow |
| `nvw_production_report.md` | Full production audit report |
