# 🍷 Developer Handoff Guide — Napa Valley Wineries (NVW) Platform

Welcome! This document provides everything you need to run, test, develop, and deploy the Napa Valley Wineries (NVW) platform.

---

## 1. Project Overview & Architecture

**Napa Valley Wineries** is a full-stack wine tourism marketplace and booking platform.

- **Frontend & Backend**: Next.js 15 (App Router with Turbopack) & React 19.
- **Database**: MongoDB Atlas via Mongoose (`src/models/`, `src/lib/dbConnect.ts`).
- **AI Concierge & Voice Search**: Google Gemini (`@google/generative-ai` & `gemini-1.5-flash`) + Web Speech API.
- **Payments**: Stripe Checkout, with support for pay-at-winery and external booking redirects.
- **Transactional Communications**: Resend for transactional email notifications (`src/lib/notifications.ts`), with Twilio/Plivo compliance scaffolding.
- **Media Hosting**: ImgBB CDN API (`/api/upload`) with fallback to base64 data URIs.
- **Styling**: Tailwind CSS, DaisyUI, Preline, and Framer Motion.

---

## 2. Directory Structure

```
NVWupgraded/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # Homepage, /winery/[id], /bookings, /itinerary, /support
│   │   ├── admin/                # Admin dashboards (/admin/dashboard, users, winery onboarding)
│   │   ├── winery-dashboard/     # Winery owner dashboards (availability, bookings, profile)
│   │   └── api/                  # Route handlers (auth, bookings, itinerary, stripe, winery, etc.)
│   ├── components/               # React components (cards, filters, voice-search, age-gate, modals)
│   ├── context/                  # React contexts (e.g. LanguageContext)
│   ├── hooks/                    # Custom hooks (useFilterStore, useToast)
│   ├── lib/                      # Core backend utilities (dbConnect, auth, rbac, slotGenerator, gemini)
│   ├── models/                   # Mongoose data models (User, Winery, Booking, SlotInventory)
│   └── store/                    # Zustand stores (authStore, uiStore) & ItineraryContext
├── scripts/                      # Database seeders and maintenance scripts
├── .env.example                  # Environment variable reference
├── env.template                  # Deployment environment template
└── package.json                  # Dependencies and build scripts
```

---

## 3. Quickstart & Local Setup

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your actual keys (see Section 4 below).

### Step 3: Seed Database (Optional for New Clusters)
```bash
npm run seed          # Seeds initial wineries and rolling 30-day slot inventory
npm run create:accounts  # Generates test admin, winery owner, and customer accounts
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Environment Variables Reference

| Variable | Required | Description | Where to Get |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | 🔴 **Yes** | MongoDB Atlas connection string | [cloud.mongodb.com](https://cloud.mongodb.com/) |
| `JWT_SECRET` | 🔴 **Yes** | Secret for signing auth tokens (64-char hex) | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `NEXT_PUBLIC_APP_URL` | 🔴 **Yes** | Base application URL | `http://localhost:3000` (local) or Vercel URL |
| `RESEND_API_KEY` | 🟡 Recommended | Transactional email provider | [resend.com](https://resend.com) |
| `EMAIL_FROM` | 🟡 Recommended | Sender email verified in Resend | `notifications@yourdomain.com` |
| `ADMIN_EMAIL` | 🟡 Recommended | Destination for administrative alerts | `admin@yourdomain.com` |
| `STRIPE_SECRET_KEY` | 🟡 Payments | Stripe private secret key | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 🟡 Payments | Stripe public publishable key | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | 🟡 Payments | Webhook signing secret | Stripe Dashboard → Webhooks |
| `GEMINI_API_KEY` | 🟡 AI Concierge | Powers natural language & voice search | [aistudio.google.com](https://aistudio.google.com/) |
| `IMGBB_API_KEY` | 🟡 Photos | CDN for winery photo uploads | [api.imgbb.com](https://api.imgbb.com/) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | 🟢 Optional | Maps & autocomplete UI | [console.cloud.google.com](https://console.cloud.google.com/) |

---

## 5. Seeded Test Accounts

When seeded, use these accounts to test different roles:

### Admin Account
- **Email**: `admin@napawineries.com`
- **Password**: `Admin123!` (or `admin123`)
- **Access**: `/admin/dashboard` — Platform stats, create winery accounts, manage users.

### Winery Owner
- **Email**: `owner@opusonewinery.com`
- **Password**: `Owner123!` (or `password123`)
- **Access**: `/winery-dashboard` — Profile, operating hours, capacity slots, approve/decline bookings.

### Customer
- **Email**: `client@example.com`
- **Password**: `Client123!` (or `customer123`)
- **Access**: Public browse, itinerary planner, booking confirmation, `/bookings`.

---

## 6. Key Business Logic & Hardening

1. **Race-Condition-Proof Slot Inventory**:
   - Located in [`src/models/slotInventory.model.ts`](file:///src/models/slotInventory.model.ts) and [`src/app/api/itinerary/book/route.ts`](file:///src/app/api/itinerary/book/route.ts).
   - Capacity reservations use atomic MongoDB `$inc: { bookedCapacity: N, availableCapacity: -N }` with filter guards (`availableCapacity: { $gte: N }`).
   - If an error occurs during checkout session creation or booking persistence, reserved capacities are rolled back automatically.

2. **Age Compliance Gate (21+)**:
   - Required by California alcohol compliance laws.
   - Enforced by both UI modal checks (`src/components/AgeGate.tsx`) and backend validation (`src/lib/ageVerification.ts`, `/api/user/verify-age`).

3. **Graceful Degradation / Fallback Architecture**:
   - **Image Uploads**: If `IMGBB_API_KEY` is not present, `/api/upload` falls back to base64 data URIs so testing image uploads never breaks.
   - **AI Features**: If `GEMINI_API_KEY` is missing, AI search gracefully returns empty filters without throwing 500 errors.
   - **Email Notifications**: If `RESEND_API_KEY` is missing, transactional notifications log warnings and return mock success instead of failing bookings.

---

## 7. Diagnostics & Healthcheck

An enhanced healthcheck endpoint is available at:
```http
GET /api/health
```
**Sample Output:**
```json
{
  "status": "ok",
  "timestamp": "2026-10-09T14:00:00.000Z",
  "uptime": 124.5,
  "subsystems": {
    "database": "connected",
    "jwtAuth": true,
    "resendEmail": true,
    "stripePayments": true,
    "stripeWebhook": true,
    "geminiAI": true,
    "imgbbCDN": true
  }
}
```

---

## 8. Deployment (Vercel)

1. Connect the GitHub repository to Vercel.
2. Framework Preset: **Next.js**.
3. Build Command: `npm run build`.
4. Output Directory: `.next`.
5. Add all required variables from `.env.example` in **Vercel Project Settings → Environment Variables**.
6. Trigger deployment on `master` branch.
