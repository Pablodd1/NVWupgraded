import nodemailer from "nodemailer";
import UserModel from "@/models/user.model";

// ========================================
// EMAIL CONFIGURATION
// ========================================

// Create ethereal test account or use configured SMTP
let transporter: nodemailer.Transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // Gmail SMTP Configuration
  const emailUser = process.env.GMAIL_USER;
  const emailPass = process.env.GMAIL_APP_PASSWORD; // Must be App Password

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else {
    // Fallback to Ethereal for dev
    console.warn("Gmail credentials not set. Falling back to test account.");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

// ========================================
// SMS CONFIGURATION (Twilio)
// ========================================

interface SMSResult {
  success: boolean;
  message?: string;
  error?: string;
}

async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const smsEnabled = process.env.NEXT_PUBLIC_ENABLE_SMS === "true";

  if (!smsEnabled) {
    return { success: false, message: "SMS disabled in configuration" };
  }

  try {
    // Check if Twilio is configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      console.warn("Twilio credentials not configured. SMS not sent.");
      return { success: false, error: "Twilio not configured" };
    }

    // Use Twilio SDK (install: npm install twilio)
    const twilio = require("twilio");
    const client = twilio(accountSid, authToken);

    const smsResult = await client.messages.create({
      body: message,
      from: from,
      to: to
    });

    return { success: true, message: smsResult.sid };
  } catch (error: any) {
    console.error("❌ SMS error:", error.message);
    return { success: false, error: error.message };
  }
}

// ========================================
// EMAIL TEMPLATES
// ========================================

const EmailHeader = (subject: string) => `
  <table style="width:100%;">
    <tbody>
      <tr>
        <td valign="top">
          <table class="es-header" align="center" style="width:100%;">
            <tbody>
              <tr>
                <td align="center">
                  <table class="es-header-body" style="width:600px;">
                    <tbody>
                      <tr>
                        <td align="left" style="padding:10px;">
                          <table style="width:100%;">
                            <tbody>
                              <tr>
                                <td valign="top" align="center" style="width:560px;">
                                  <div style="display: flex; align-items: center; justify-content: center;">
                                    <div style="text-align: center;">
                                      <span style="font-family: 'Georgia', serif; font-size: 36px; font-weight: 800; color: #6B1E23; line-height: 1.2;">🍷 Napa Valley Wineries</span>
                                      <br>
                                      <small style="font-family: 'Georgia', serif; font-size: 14px; color: #6b7280; line-height: 1.2;">${subject}</small>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
`;

const EmailContentWrapper = (content: string) => `
  <table style="width:100%;">
    <tbody>
      <tr>
        <td align="center">
          <table style="width:600px; background-color:#ffffff; padding:20px; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tbody>
              <tr>
                <td style="font-family: 'Helvetica', Arial, sans-serif; font-size:16px; color:#333333; line-height:1.6;">
                  ${content}
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
`;

const EmailFooter = () => `
  <table style="width:100%;">
    <tbody>
      <tr>
        <td align="center">
          <table style="width:600px; padding:20px;">
            <tbody>
              <tr>
                <td style="font-family: 'Helvetica', Arial, sans-serif; font-size:12px; color:#999999; text-align:center;">
                  <p style="margin: 10px 0;">© ${new Date().getFullYear()} Napa Valley Wineries. All rights reserved.</p>
                  <p style="margin: 10px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" style="color:#6B1E23; text-decoration:none;">Visit our website</a>
                    &nbsp;|&nbsp;
                    <a href="mailto:support@napawineries.com" style="color:#6B1E23; text-decoration:none;">Contact Support</a>
                  </p>
                  <p style="margin: 10px 0; font-size:11px;">
                    This email was sent because you have an active booking with Napa Valley Wineries.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
`;

const EmailTemplate = ({ content, subject }: { content: string; subject: string }) => `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${subject}</title>
      <style type="text/css">
        body {
          background-color:#F5F5F5;
          font-family: 'Helvetica', Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        table { border-collapse: collapse; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #6B1E23;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #8B2530;
        }
      </style>
    </head>
    <body style="margin:0;padding:20px 0;width:100%;">
      <div>
        ${EmailHeader(subject)}
        ${EmailContentWrapper(content)}
        ${EmailFooter()}
      </div>
    </body>
  </html>
`;

// ========================================
// BOOKING NOTIFICATION TEMPLATES
// ========================================

interface BookingNotificationData {
  bookingId: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string;
  wineryName: string;
  wineryEmail: string;
  wineryPhone?: string;
  bookingDate: string;
  bookingTime: string;
  numberOfGuests: number;
  specialRequests?: string;
}

function getCustomerBookingConfirmationEmail(data: BookingNotificationData) {
  const content = `
    <h2 style="color:#6B1E23; margin-bottom:24px;">Booking Confirmed! 🎉</h2>
    
    <p style="font-size:16px;">Dear ${data.customerFirstName},</p>
    
    <p>Your wine tasting experience at <strong>${data.wineryName}</strong> has been confirmed!</p>
    
    <div style="background-color:#F9F9F9; padding:20px; border-radius:8px; margin:24px 0;">
      <h3 style="color:#6B1E23; margin-top:0;">Booking Details:</h3>
      <table style="width:100%;">
        <tr>
          <td style="padding:8px 0;"><strong>Booking ID:</strong></td>
          <td style="padding:8px 0;">${data.bookingId}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Winery:</strong></td>
          <td style="padding:8px 0;">${data.wineryName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Date:</strong></td>
          <td style="padding:8px 0;">${data.bookingDate}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Time:</strong></td>
          <td style="padding:8px 0;">${data.bookingTime}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Guests:</strong></td>
          <td style="padding:8px 0;">${data.numberOfGuests}</td>
        </tr>
      </table>
    </div>
    
    ${data.specialRequests ? `
      <div style="background-color:#FFF9E6; padding:16px; border-left:4px solid #FFC107; margin:16px 0;">
        <strong>Your Special Requests:</strong>
        <p style="margin:8px 0 0 0;">${data.specialRequests}</p>
      </div>
    ` : ''}
    
    <div style="margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" class="button">View Your Bookings</a>
    </div>
    
    <p style="color:#666;">
      <strong>What's next?</strong><br>
      The winery will review your booking and send you final confirmation. 
      If you have any questions, feel free to contact ${data.wineryName} directly.
    </p>
    
    <p style="margin-top:24px;">
      Looking forward to your visit!<br>
      <strong>The Napa Valley Wineries Team</strong>
    </p>
  `;

  return EmailTemplate({
    content,
    subject: `Booking Confirmed at ${data.wineryName}`
  });
}

function getWineryBookingNotificationEmail(data: BookingNotificationData) {
  const content = `
    <h2 style="color:#6B1E23; margin-bottom:24px;">New Booking Received 📋</h2>
    
    <p style="font-size:16px;">Dear ${data.wineryName} Team,</p>
    
    <p>You have received a new booking through Napa Valley Wineries!</p>
    
    <div style="background-color:#F9F9F9; padding:20px; border-radius:8px; margin:24px 0;">
      <h3 style="color:#6B1E23; margin-top:0;">Customer Information:</h3>
      <table style="width:100%;">
        <tr>
          <td style="padding:8px 0;"><strong>Name:</strong></td>
          <td style="padding:8px 0;">${data.customerFirstName} ${data.customerLastName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Email:</strong></td>
          <td style="padding:8px 0;"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td>
        </tr>
        ${data.customerPhone ? `
        <tr>
          <td style="padding:8px 0;"><strong>Phone:</strong></td>
          <td style="padding:8px 0;"><a href="tel:${data.customerPhone}">${data.customerPhone}</a></td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="background-color:#E8F5E9; padding:20px; border-radius:8px; margin:24px 0;">
      <h3 style="color:#6B1E23; margin-top:0;">Booking Details:</h3>
      <table style="width:100%;">
        <tr>
          <td style="padding:8px 0;"><strong>Booking ID:</strong></td>
          <td style="padding:8px 0;">${data.bookingId}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Date:</strong></td>
          <td style="padding:8px 0;">${data.bookingDate}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Time:</strong></td>
          <td style="padding:8px 0;">${data.bookingTime}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Guests:</strong></td>
          <td style="padding:8px 0;">${data.numberOfGuests}</td>
        </tr>
      </table>
    </div>
    
    ${data.specialRequests ? `
      <div style="background-color:#FFF9E6; padding:16px; border-left:4px solid #FFC107; margin:16px 0;">
        <strong>Special Requests from Customer:</strong>
        <p style="margin:8px 0 0 0;">${data.specialRequests}</p>
      </div>
    ` : ''}
    
    <div style="margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/winery-dashboard/bookings" class="button">Manage Bookings</a>
    </div>
    
    <p style="color:#666;">
      Please review and confirm this booking in your dashboard at your earliest convenience.
    </p>
  `;

  return EmailTemplate({
    content,
    subject: `New Booking - ${data.customerFirstName} ${data.customerLastName}`
  });
}

function getAdminBookingNotificationEmail(data: BookingNotificationData) {
  const content = `
    <h2 style="color:#6B1E23; margin-bottom:24px;">New Booking Notification 📊</h2>
    
    <p style="font-size:16px;">Admin Alert</p>
    
    <p>A new booking has been created on the platform:</p>
    
    <div style="background-color:#F9F9F9; padding:20px; border-radius:8px; margin:24px 0;">
      <h3 style="color:#6B1E23; margin-top:0;">Booking Summary:</h3>
      <table style="width:100%;">
        <tr>
          <td style="padding:8px 0;"><strong>Booking ID:</strong></td>
          <td style="padding:8px 0;">${data.bookingId}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Customer:</strong></td>
          <td style="padding:8px 0;">${data.customerFirstName} ${data.customerLastName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Winery:</strong></td>
          <td style="padding:8px 0;">${data.wineryName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Date:</strong></td>
          <td style="padding:8px 0;">${data.bookingDate}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Time:</strong></td>
          <td style="padding:8px 0;">${data.bookingTime}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;"><strong>Guests:</strong></td>
          <td style="padding:8px 0;">${data.numberOfGuests}</td>
        </tr>
      </table>
    </div>
    
    <div style="margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" class="button">View in Admin Panel</a>
    </div>
  `;

  return EmailTemplate({
    content,
    subject: `New Booking - ${data.bookingId}`
  });
}

// ========================================
// SEND BOOKING NOTIFICATIONS
// ========================================

export interface SendBookingNotificationsParams {
  bookingId: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string;
  wineryName: string;
  wineryEmail: string;
  wineryPhone?: string;
  bookingDateTime: string; // ISO string
  numberOfGuests?: number;
  specialRequests?: string;
}

// ========================================
// ACCOUNT WELCOME NOTIFICATIONS
// ========================================

export async function sendWelcomeNotification(user: any, isWinery: boolean = false) {
  const subject = isWinery ? "Welcome to NVW Winery Partner Program! 🍷" : "Welcome to Napa Valley Wineries! ✨";
  const content = `
    <h2 style="color:#6B1E23; margin-bottom:24px;">Welcome, ${user.firstName}!</h2>
    <p>We're thrilled to have you join our community of wine enthusiasts.</p>
    <p>${isWinery
      ? "As a winery partner, you can now manage your profile, list your tasting experiences, and track bookings through your professional dashboard."
      : "You can now explore the best wineries in Napa, curate your own itineraries, and book tasting experiences directly."}</p>
    <div style="margin:24px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/${isWinery ? 'winery-dashboard' : 'wineries'}" class="button">Access My Account</a>
    </div>
  `;

  const transport = await getTransporter();
  await transport.sendMail({
    from: process.env.GMAIL_USER || "notifications@napawineries.com",
    to: user.email,
    subject,
    html: EmailTemplate({ content, subject })
  });
}

// ========================================
// FINAL CONFIRMATION / DECLINE NOTIFICATIONS
// ========================================

export async function sendFinalBookingDecision(booking: any, winery: any, customer: any, status: 'confirmed' | 'declined', reason?: string) {
  const isConfirmed = status === 'confirmed';
  const subject = isConfirmed ? `Final Confirmation: Your visit to ${winery.name} is set!` : `Update regarding your booking at ${winery.name}`;

  const content = `
    <h2 style="color:${isConfirmed ? '#2E7D32' : '#C62828'}; margin-bottom:24px;">
      ${isConfirmed ? 'Booking Officially Confirmed! 🎉' : 'Booking Could Not Be Completed'}
    </h2>
    <p>Hi ${customer.firstName},</p>
    <p>${isConfirmed
      ? `Good news! <strong>${winery.name}</strong> has reviewed and confirmed your wine tasting request.`
      : `Unfortunately, <strong>${winery.name}</strong> is unable to host your requested slot at this time.`}</p>
    
    ${!isConfirmed && reason ? `<p style="padding: 10px; background: #FFF5F5; border-left: 4px solid #C62828;"><strong>Reason from Winery:</strong> ${reason}</p>` : ''}

    <div style="background-color:#F9F9F9; padding:20px; border-radius:8px; margin:24px 0;">
      <h3 style="color:#6B1E23; margin-top:0;">Visit Details:</h3>
      <p><strong>Winery:</strong> ${winery.name}</p>
      <p><strong>Date:</strong> ${new Date(booking.datetime).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${new Date(booking.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    </div>

    ${isConfirmed ? `
      <p><strong>Travel Tip:</strong> We recommend arriving 10 minutes prior to your slot to settle in.</p>
      <div style="margin:24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" class="button">View My Itinerary</a>
      </div>
    ` : ''}
  `;

  const transport = await getTransporter();
  await transport.sendMail({
    from: process.env.GMAIL_USER || "notifications@napawineries.com",
    to: customer.email,
    subject,
    html: EmailTemplate({ content, subject })
  });

  // SMS Final Decision
  if (customer.phone) {
    const smsMsg = isConfirmed
      ? `Great news! ${winery.name} has confirmed your booking for ${new Date(booking.datetime).toLocaleDateString()}. See you then!`
      : `Sorry, ${winery.name} was unable to confirm your booking request. Check the app for other available slots.`;
    await sendSMS(customer.phone, smsMsg);
  }
}

// ========================================
// 1-HOUR REMINDERS (Framework)
// ========================================

export async function sendHourReminder(customer: any, wineryName: string, time: string) {
  const subject = "Tasting Reminder: See you in 1 hour! 🍷";
  const content = `
    <h2 style="color:#6B1E23;">See you soon!</h2>
    <p>Hi ${customer.firstName}, just a friendly reminder that your tasting at <strong>${wineryName}</strong> begins in approximately one hour at ${time}.</p>
    <p>Safe travels!</p>
  `;

  const transport = await getTransporter();
  await transport.sendMail({
    from: process.env.GMAIL_USER || "notifications@napawineries.com",
    to: customer.email,
    subject,
    html: EmailTemplate({ content, subject })
  });

  if (customer.phone) {
    await sendSMS(customer.phone, `Reminder: Your tasting at ${wineryName} is in 1 hour (${time}). Cheers!`);
  }
}

// ========================================
// SEND INITIAL BOOKING NOTIFICATIONS
// ========================================

export interface SendBookingNotificationsParams {
  bookingId: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string;
  wineryName: string;
  wineryEmail: string;
  wineryPhone?: string;
  bookingDateTime: string; // ISO string
  numberOfGuests?: number;
  specialRequests?: string;
}

export async function sendBookingNotifications(params: SendBookingNotificationsParams) {
  const results = {
    emails: [] as any[],
    sms: [] as any[]
  };

  try {
    const bookingDate = new Date(params.bookingDateTime);
    const data: BookingNotificationData = {
      bookingId: params.bookingId,
      customerFirstName: params.customerFirstName,
      customerLastName: params.customerLastName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      wineryName: params.wineryName,
      wineryEmail: params.wineryEmail,
      wineryPhone: params.wineryPhone,
      bookingDate: bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      bookingTime: bookingDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      numberOfGuests: params.numberOfGuests || 1,
      specialRequests: params.specialRequests
    };

    const transport = await getTransporter();
    const from = process.env.GMAIL_USER || "notifications@napawineries.com";

    // 1. Initial Email to Customer
    try {
      await transport.sendMail({
        from,
        to: data.customerEmail,
        subject: `Request Received: ${data.wineryName}`,
        html: getCustomerBookingConfirmationEmail(data)
      });
      results.emails.push({ to: data.customerEmail, status: "success" });
    } catch (e: any) { results.emails.push({ to: data.customerEmail, status: "error", error: e.message }); }

    // 2. Email to Winery Owner
    try {
      await transport.sendMail({
        from,
        to: data.wineryEmail,
        subject: `New Booking Request - ${data.customerFirstName}`,
        html: getWineryBookingNotificationEmail(data)
      });
      results.emails.push({ to: data.wineryEmail, status: "success" });
    } catch (e: any) { results.emails.push({ to: data.wineryEmail, status: "error", error: e.message }); }

    return { success: true, results };
  } catch (error: any) {
    console.error("Booking Notification Error:", error);
    return { success: false, error: error.message };
  }
}

export default {
  sendBookingNotifications,
  sendFinalBookingDecision,
  sendWelcomeNotification,
  sendHourReminder,
  getTransporter
};
