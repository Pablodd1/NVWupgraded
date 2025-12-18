# Email & SMS Notification System

## 🎯 Overview

Comprehensive booking notification system that sends **beautiful HTML emails** and **SMS messages** to customers, wineries, and administrators.

## 📧 Email Notifications

### Ethereal Email (Default - No Setup Required)
The system automatically creates a **free test email account** using [Ethereal Email](https://ethereal.email/):
- **No signup required**
- **No API keys needed**
- **Perfect for development & testing**
- **All emails captured in a web inbox**

When the app starts, check the console for:
```
📧 Ethereal Email Account Created:
   User: random-user@ethereal.email
   Pass: generated-password
   View emails at: https://ethereal.email/messages
```

Visit the Ethereal inbox to see all sent emails!

### Production Email Setup

For production, configure your own SMTP server in `.env.local`:

```env
# Gmail Example
MAILTRAP_HOST=smtp.gmail.com
MAILTRAP_PORT=587
MAILTRAP_USER=your-email@gmail.com
MAILTRAP_PASS=your-app-specific-password
EMAIL_FROM=notifications@yourdomain.com
```

**Supported SMTP Providers:**
- **Gmail**: Use App-Specific Password (2FA required)
- **SendGrid**: Free tier 100 emails/day
- **AWS SES**: 62,000 emails/month free
- **Mailgun**: 5,000 emails/month free
- **Postmark**: 100 emails/month free

## 📱 SMS Notifications (Optional)

SMS is **disabled by default**. To enable:

### Step 1: Sign up for Twilio
1. Go to [twilio.com](https://www.twilio.com/)
2. Create free account (get $15 credit)
3. Get a phone number (+1 xxx-xxx-xxxx)

### Step 2: Configure `.env.local`
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
NEXT_PUBLIC_ENABLE_SMS=true
```

### Step 3: Install Twilio SDK
```bash
npm install twilio
```

**SMS Will Be Sent:**
- ✅ When customer books a winery
- ✅ When winery receives a booking

## 🎨 Email Templates

### Customer Confirmation Email
**Subject:** `Booking Confirmed at [Winery Name]`

**Includes:**
- 🎉 Welcoming header with Napa Valley Wineries branding
- 📋 Complete booking details (ID, date, time, guests)
- 📝 Special requests (if any)
- 🔗 "View Your Bookings" button
- 💡 What's next guidance

### Winery Notification Email
**Subject:** `New Booking - [Customer Name]`

**Includes:**
- 📋 Booking notification
- 👤 Customer contact details (name, email, phone)
- 📅 Booking details (date, time, guests)
- 📝 Special requests from customer
- 🔗 "Manage Bookings" dashboard link

### Admin Alert Email
**Subject:** `New Booking - [Booking ID]`

**Includes:**
- 📊 System-level booking notification
- 📋 Summary (customer, winery, date, time)
- 🔗 "View in Admin Panel" link

## 🚀 How It Works

### Booking Flow with Notifications
```
1. Customer books winery experience
   ↓
2. System creates booking in database
   ↓
3. Inventory capacity is reserved
   ↓
4. Notification System Activated:
   
   📧 Email sent to:
      - Customer (confirmation)
      - Winery (new booking alert)
      - Admin (system alert)
   
   📱 SMS sent to:
      - Customer's phone (if provided)
      - Winery's phone (if provided)
   ↓
5. Success response returned
```

### Email Preview URLs
In development, all emails show preview URLs in console:
```bash
📧 Customer email sent: https://ethereal.email/message/xxxxxxxxxxx
📧 Winery email sent: https://ethereal.email/message/xxxxxxxxxxx
```

Click the URLs to view beautiful HTML emails in your browser!

## 📋 API Integration

### Booking API (`/api/itinerary/book`)
```typescript
POST /api/itinerary/book

// After successful booking:
{
  "message": "Booking created successfully",
  "booking": { ... },
  "notifications": [
    {
      "wineryId": "...",
      "wineryName": "Opus One Winery",
      "notifications": {
        "success": true,
        "results": {
          "emails": [
            {
              "to": "customer@email.com",
              "status": "success",
              "messageId": "...",
              "previewUrl": "https://ethereal.email/message/..."
            },
            {
              "to": "winery@email.com",
              "status": "success",
              "messageId": "..."
            }
          ],
          "sms": [
            {
              "to": "+1234567890",
              "success": false,
              "message": "SMS disabled in configuration"
            }
          ]
        }
      }
    }
  ]
}
```

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

console.log(result);
// {
//   success: true,
//   results: {
//     emails: [...],
//     sms: [...]
//   }
// }
```

## 🎨 Email Design Features

- ✅ **Responsive Design**: Works on mobile, tablet, desktop
- ✅ **Wine-Themed Colors**: #6B1E23 (burgundy) brand color
- ✅ **Professional Layout**: Clean, readable, organized
- ✅ **Call-to-Action Buttons**: Primary action buttons with hover effects
- ✅ **Information Cards**: Color-coded sections for easy reading
- ✅ **Footer Links**: Contact support, website, unsubscribe
- ✅ **HTML Tables**: Wide email client compatibility

## 📊 Notification Status Tracking

All notification results are logged and returned:

```typescript
{
  emails: [
    {
      to: "customer@email.com",
      status: "success" | "error",
      messageId: "...",
      previewUrl: "...", // Ethereal only
      error: "..." // If failed
    }
  ],
  sms: [
    {
      to: "+1234567890",
      success: true | false,
      message: "...", // Twilio SID or disable message
      error: "..." // If failed
    }
  ]
}
```

## 🧪 Testing

### Test Email Delivery
```bash
# Start the dev server
npm run dev

# Create a test booking
# Check console for Ethereal URLs
# Click URLs to view emails in browser
```

### Test SMS (if enabled)
```bash
# Ensure Twilio is configured
# Use a verified phone number (free tier)
# Create a booking
# Check phone for SMS
```

## 🔐 Security Best Practices

1. **Never commit credentials**
   - `.env.local` is in `.gitignore`
   - Use environment variables in production

2. **Use App-Specific Passwords**
   - Gmail requires 2FA + app password
   - Never use your main password

3. **Rate Limiting**
   - Twilio has daily limits
   - Monitor usage to avoid overages

4. **Email Validation**
   - All emails validated before sending
   - Invalid emails logged, not sent

## 🚀 Production Deployment

### Environment Variables Checklist
```bash
# Email (Required)
✅ MAILTRAP_HOST=smtp.yourprovider.com
✅ MAILTRAP_PORT=587
✅ MAILTRAP_USER=your-email@domain.com
✅ MAILTRAP_PASS=your-password
✅ EMAIL_FROM=notifications@yourdomain.com

# SMS (Optional)
⬜ TWILIO_ACCOUNT_SID=ACxxxxx
⬜ TWILIO_AUTH_TOKEN=xxxxx
⬜ TWILIO_PHONE_NUMBER=+1234567890
⬜ NEXT_PUBLIC_ENABLE_SMS=true

# App URL (Required)
✅ NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Deployment Steps
1. Set all environment variables in hosting platform
2. Test email delivery with a booking
3. Monitor logs for email success/failures
4. (Optional) Enable SMS after testing email

## 📈 Future Enhancements

- [ ] **Booking Reminders**: Send reminder 24h before booking
- [ ] **Cancellation Emails**: Notify all parties of cancellations
- [ ] **Review Requests**: Email customers after their visit
- [ ] **Newsletter Integration**: Marketing emails to customers
- [ ] **Email Templates Editor**: Admin UI to customize templates
- [ ] **WhatsApp Integration**: Alternative to SMS
- [ ] **Push Notifications**: In-app notifications
- [ ] **Delivery Analytics**: Track open rates, click rates

## ✅ Implementation Status

**Phase 5: Email & SMS Notifications** ✅ **COMPLETE**

- ✅ Ethereal Email auto-configuration (no setup)
- ✅ Beautiful HTML email templates
- ✅ Customer booking confirmations
- ✅ Winery booking alerts
- ✅ Admin system notifications
- ✅ SMS integration (Twilio ready)
- ✅ Comprehensive error handling
- ✅ Preview URLs for testing
- ✅ Production-ready SMTP support

---

**Last Updated**: Phase 5 Implementation  
**Status**: ✅ Complete and Ready for Production
