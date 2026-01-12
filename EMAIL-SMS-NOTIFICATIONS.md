# Email & SMS Notification System

## 🎯 Overview

Comprehensive booking notification system that sends **beautiful HTML emails** and **SMS messages** to customers, wineries, and administrators.

## 📧 Email Notifications

### Provider: Resend (Primary)
The system is integrated with [Resend](https://resend.com) for high-deliverability transactional emails.

**Configuration Requirements (.env.local):**
```env
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=notifications@yourdomain.com
NEXT_PUBLIC_APP_URL=https://napa-one.vercel.app
```

**Benefits:**
- ✅ Modern API-based sending (no SMTP overhead)
- ✅ High deliverability with verified domains
- ✅ Detailed tracking and analytics in Resend dashboard
- ✅ Support for complex HTML templates and attachments

## 📱 SMS Notifications (Optional)

SMS is **enabled by default** if credentials are provided. To configure:

### Step 1: Sign up for Twilio
1. Go to [twilio.com](https://www.twilio.com/)
2. Create free account (get $15 credit) or production account
3. Get a phone number (+1 xxx-xxx-xxxx)

### Step 2: Configure `.env.local`
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
NEXT_PUBLIC_ENABLE_SMS=true
```

**SMS Will Be Sent For:**
- ✅ Initial Itinerary Requests
- ✅ Booking Confirmations/Declines
- ✅ 1-Hour Tasting Reminders (+ Directions)
- ✅ Critical System Errors (Admin alert)

## 🎨 Email Templates

### 1. Customer Welcome Email
**Subject:** `Welcome to Napa Valley Wineries! ✨`
- Sent immediately upon registration.

### 2. Itinerary Summary
**Subject:** `Your Napa Valley Itinerary - Request Received`
- Sent after choosing multiple wineries and submitting.

### 3. Winery Notification
**Subject:** `New Booking Request - [Customer Name]`
- Alerts winery owners of pending requests.

### 4. Final Booking Decision
**Subject:** `Final Confirmation: Your visit to [Winery] is set!`
- Sent when a winery confirms or declines a specific slot.

### 5. Tasting Reminders
**Subject:** `Tasting Reminder: See you in 1 hour! 🍷`
- Automated reminder with Google Maps/Uber integration.

## 🚀 How It Works

### Booking Flow with Notifications
```
1. Customer submits itinerary
   ↓
2. System creates records in MongoDB
   ↓
3. Notification Service Activated:
   
   📧 Resend Emails:
      - Customer (itinerary summary)
      - Winery Owners (individual booking alerts)
      - Admin (platform overview)
   
   📱 Twilio SMS:
      - Customer (confirmation text)
   ↓
4. Winery Responds (Confirm/Decline)
   ↓
5. Final Notification sent to Customer (Email + SMS)
```

## 📋 API Integration

### Booking API (`/api/itinerary/book`)
The notification logic is handled internally within the API route calling `src/lib/notifications.ts`.

### Notification Service Usage
```typescript
import { sendBookingNotifications } from "@/lib/notifications";

const result = await sendBookingNotifications({
  bookingId: "booking_123",
  customerFirstName: "John",
  customerLastName: "Doe",
  customerEmail: "john@example.com",
  customerPhone: "+12345678900", // Optional
  wineryName: "Opus One Winery",
  wineryEmail: "contact@opusonewinery.com",
  wineryPhone: "+19876543210", // Optional
  bookingDateTime: "2025-12-20T14:00:00Z",
  numberOfGuests: 4,
  specialRequests: "Vegetarian options please" // Optional
});
```

## 🧪 Testing

### Test Email Delivery
1. Ensure `RESEND_API_KEY` is set.
2. Sign up as a new user or create a booking.
3. Check your recipient inbox or the Resend dashboard logs.

### Test SMS
1. Ensure `NEXT_PUBLIC_ENABLE_SMS=true` and Twilio keys are valid.
2. Verify the Recipient Phone Number is in E.164 format (e.g., +15555555555).
3. Check the Twilio console for message logs.

## 🔐 Compliance (Twilio Requirement)
The system enforces strict opt-in rules:
- **Age Gate**: Users must be 21+ to receive SMS alerts.
- **Opt-In**: SMS is only sent if `smsConsent` is true.
- **Opt-Out**: Every SMS includes "Reply STOP to opt out".

## 🚨 Error Reporting
The system automatically notifies the admin via Email/SMS during:
- Database connection failures
- Payment verification errors
- Runtime crashes in API routes

**Config:**
```env
ADMIN_EMAIL=admin@napawineries.com
ADMIN_PHONE=+15555555555
```

---

**Last Updated**: 2026-01-06 (Post-Resend Migration) 
**Status**: ✅ Production Ready
