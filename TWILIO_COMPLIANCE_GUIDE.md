
# 📱 Twilio A2P 10DLC / Toll-Free Compliance Guide

This document contains the exact information you should copy/paste into the Twilio Console when registering your Brand and Campaign.

## 1. Business Information
Ensure this matches your tax documents EXACTLY.
*   **Legal Company Name:** Napa Valley Wineries Inc. (Example)
*   **Business Type:** Private Profit
*   **Industry:** Hospitality / Food & Beverage
*   **Website:** https://napavalleywineries.com (or your Vercel URL)

## 2. Uses Case Information
*   **Use Case Category:** 2FA / Customer Care / Mixed
*   **Campaign Description:**
    > This campaign sends transactional booking confirmations, itinerary updates, and payment receipts to users who have booked wine tastings on our platform. It also assists users with account verification.

## 3. Message Flow (Call to Action)
They will ask "How do end users consent to receive messages?".
> End users opt-in via a checkbox on the registration form found at [Insert URL]/#login. The checkbox is labeled "Text me booking confirmations" and is unchecked by default. Directly below the checkbox, concise disclosure text states "Reply STOP to unsubscribe at any time. Msg & data rates may apply. See Privacy Policy."

## 4. Sample Messages
You must provide examples of Every type of message you send.

**Sample 1 (Confirmation):**
> Napa Valley Wineries: Hi John, your tasting at Stag's Leap is confirmed for 12/25 at 2:00 PM. View your itinerary here: https://napa.com/itinerary/123. Reply STOP to opt out.

**Sample 2 (Reminder):**
> Napa Valley Wineries: Reminder, your tasting starts in 1 hour! Directions: https://maps.google.com/.... Reply HELP for help.

**Sample 3 (Authentication - if applicable):**
> Your Napa Valley verification code is 1234. Do not share this code.

## 5. Opt-Out Keywords
Twilio manages these automatically, but you must declare them.
*   **Keywords:** STOP, END, CANCEL, UNSUBSCRIBE, QUIT
*   **Response:** "You have been unsubscribed from Napa Valley Wineries and will no longer receive messages. Reply START to rejoin."

## 6. Help Keywords
*   **Keywords:** HELP, INFO
*   **Response:** "Napa Valley Wineries Help: Contact support@napavalleywineries.com or visit https://napavalleywineries.com/support. Reply STOP to cancel."

## 7. Privacy Policy
*   **Link:** https://[YOUR_DOMAIN]/privacy
*   **Requirement:** The policy MUST explicitly state that mobile numbers are not shared with third parties for marketing.
    *   *We have added this clause to your new Privacy Page.*

## 8. Opt-In Image
*   Take a screenshot of your "Sign Up" modal showing the unchecked SMS checkbox and the disclosure text. Upload this screenshot to Twilio as proof of opt-in.
