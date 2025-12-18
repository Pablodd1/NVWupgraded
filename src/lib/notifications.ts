import nodemailer from "nodemailer";
import UserModel from "@/models/user.model";

// ========================================
// EMAIL CONFIGURATION
// ========================================

// Create ethereal test account or use configured SMTP
let transporter: nodemailer.Transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // Check if SMTP credentials are configured
  const hasConfig = process.env.MAILTRAP_HOST && 
                    process.env.MAILTRAP_USER && 
                    process.env.MAILTRAP_PASS;

  if (hasConfig) {
    // Use configured SMTP
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: parseInt(process.env.MAILTRAP_PORT || "587", 10),
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    } as nodemailer.TransportOptions);
  } else {
    // Create test account using Ethereal Email
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
    console.log("📧 Ethereal Email Account Created:");
    console.log("   User:", testAccount.user);
    console.log("   Pass:", testAccount.pass);
    console.log("   View emails at: https://ethereal.email/messages");
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
    console.log("📱 SMS disabled. Would have sent to", to, ":", message);
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

    console.log("✅ SMS sent:", smsResult.sid);
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

    // Get transporter
    const transport = await getTransporter();
    const from = process.env.EMAIL_FROM || "notifications@napawineries.com";

    // Send customer email
    try {
      const customerEmail = await transport.sendMail({
        from,
        to: data.customerEmail,
        subject: `Booking Confirmed at ${data.wineryName}`,
        html: getCustomerBookingConfirmationEmail(data)
      });
      
      results.emails.push({
        to: data.customerEmail,
        status: "success",
        messageId: customerEmail.messageId,
        previewUrl: nodemailer.getTestMessageUrl(customerEmail)
      });
      
      console.log("📧 Customer email sent:", nodemailer.getTestMessageUrl(customerEmail));
    } catch (error: any) {
      results.emails.push({
        to: data.customerEmail,
        status: "error",
        error: error.message
      });
    }

    // Send winery email
    try {
      const wineryEmail = await transport.sendMail({
        from,
        to: data.wineryEmail,
        subject: `New Booking - ${data.customerFirstName} ${data.customerLastName}`,
        html: getWineryBookingNotificationEmail(data)
      });
      
      results.emails.push({
        to: data.wineryEmail,
        status: "success",
        messageId: wineryEmail.messageId,
        previewUrl: nodemailer.getTestMessageUrl(wineryEmail)
      });
      
      console.log("📧 Winery email sent:", nodemailer.getTestMessageUrl(wineryEmail));
    } catch (error: any) {
      results.emails.push({
        to: data.wineryEmail,
        status: "error",
        error: error.message
      });
    }

    // Send admin emails
    const adminUsers = await UserModel.find({ role: "admin" }).select("email");
    for (const admin of adminUsers) {
      try {
        const adminEmail = await transport.sendMail({
          from,
          to: admin.email,
          subject: `New Booking - ${data.bookingId}`,
          html: getAdminBookingNotificationEmail(data)
        });
        
        results.emails.push({
          to: admin.email,
          status: "success",
          messageId: adminEmail.messageId,
          previewUrl: nodemailer.getTestMessageUrl(adminEmail)
        });
      } catch (error: any) {
        results.emails.push({
          to: admin.email,
          status: "error",
          error: error.message
        });
      }
    }

    // Send SMS notifications (if enabled)
    if (data.customerPhone) {
      const customerSMS = await sendSMS(
        data.customerPhone,
        `Hi ${data.customerFirstName}! Your booking at ${data.wineryName} for ${data.bookingDate} at ${data.bookingTime} is confirmed. Booking ID: ${data.bookingId}`
      );
      results.sms.push({ to: data.customerPhone, ...customerSMS });
    }

    if (data.wineryPhone) {
      const winerySMS = await sendSMS(
        data.wineryPhone,
        `New booking: ${data.customerFirstName} ${data.customerLastName} for ${data.bookingDate} at ${data.bookingTime}. ${data.numberOfGuests} guests. ID: ${data.bookingId}`
      );
      results.sms.push({ to: data.wineryPhone, ...winerySMS });
    }

    return {
      success: true,
      results
    };
  } catch (error: any) {
    console.error("Error sending booking notifications:", error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
}

export default {
  sendBookingNotifications,
  getTransporter
};
