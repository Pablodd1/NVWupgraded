import nodemailer from "nodemailer";
import UserModel from "@/models/user.model";

// Configure Mailtrap SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST as string,
  port: parseInt(process.env.MAILTRAP_PORT as string, 10),
  auth: {
    user: process.env.MAILTRAP_USER as string,
    pass: process.env.MAILTRAP_PASS as string,
  },
} as nodemailer.TransportOptions);

// Email Header
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
                                  <a href="${process.env.NEXTAUTH_URL || "https://yourplatform.com"}" target="_blank" style="display: flex; align-items: center; text-decoration: none;">
                                    <img src="${process.env.NEXTAUTH_URL || "https://yourplatform.com"}/logo.png" width="25" height="25" alt="NVW Logo" style="border:0; margin-right: 12px;">
                                    <div style="display: flex; flex-direction: column;">
                                      <span style="font-family: serif; font-size: 36px; font-weight: 800; color: #1a202c; line-height: 1.2;">NVW</span>
                                      <small style="font-family: serif; font-size: 12px; color: #6b7280; line-height: 1.2;">Napa Valley Winery</small>
                                    </div>
                                  </a>
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

// Email Content Wrapper (Assumed implementation)
const EmailContentWrapper = (content: string) => `
  <table style="width:100%;">
    <tbody>
      <tr>
        <td align="center">
          <table style="width:600px; background-color:#ffffff; padding:20px; border-radius:8px;">
            <tbody>
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#0e0e0e;">
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

// Email Footer (Assumed implementation)
const EmailFooter = () => `
  <table style="width:100%;">
    <tbody>
      <tr>
        <td align="center">
          <table style="width:600px; padding:10px;">
            <tbody>
              <tr>
                <td style="font-family: Arial, Helvetica, sans-serif; font-size:12px; color:#666666;">
                  <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || "NVW"}. All rights reserved.</p>
                  <p>Contact us at <a href="mailto:support@${process.env.NEXT_PUBLIC_SITE_NAME?.toLowerCase() || "nvw"}.com">support@${process.env.NEXT_PUBLIC_SITE_NAME?.toLowerCase() || "nvw"}.com</a></p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
`;

// Email Template Wrapper
const EmailTemplate = ({ content, subject }: { content: string; subject: string }) => `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>${subject}</title>
      <style type="text/css">
        body {
          background-color:#F5F9FF;
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body style="margin:0;padding:0;width:100%;">
      <div>
        ${EmailHeader(subject)}
        ${EmailContentWrapper(content)}
        ${EmailFooter()}
      </div>
    </body>
  </html>
`;

// Email templates
const getCustomerEmailTemplate = (booking: any, status: string) => {
  const content = `
    <p style="font-size:20px;color:#0e0e0e;">Dear ${booking.customerName},</p>
    <p style="font-size:14px;color:#0e0e0e;padding-top:20px;">Your booking with ${booking.wineryName} has been ${status}.</p>
    <p style="font-size:14px;color:#0e0e0e;padding-top:20px;">Booking Details:</p>
    <ul style="font-size:14px;color:#0e0e0e;">
      <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
      <li>Time: ${booking.time}</li>
    </ul>
    <p style="font-size:14px;color:#0e0e0e;padding-top:20px;">Thank you for using our platform!</p>
  `;
  return EmailTemplate({ content, subject: `Booking ${status} - ${booking.wineryName}` });
};

const getWineryEmailTemplate = (booking: any, status: string) => {
  const content = `
    <p style="font-size:20px;color:#0e0e0e;">Dear ${booking.wineryName} Team,</p>
    <p style="font-size:14px;color:#0e0e0e;padding-top:20px;">A booking has been ${status}.</p>
    <p style="font-size:14px;color:#0e0e0e;padding-top:20px;">Booking Details:</p>
    <ul style="font-size:14px;color:#0e0e0e;">
      <li>Customer: ${booking.customerName}</li>
      <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
      <li>Time: ${booking.time}</li>
    </ul>
  `;
  return EmailTemplate({ content, subject: `Booking ${status} Notification` });
};

const getAdminEmailTemplate = (booking: any, status: string) => {
  const content = `
    <p style="font-size:20px;color:#0e0e0e;">Booking Status Update Notification</p>
    <p style="font-size:14px;color:#0e0e0e;padding-top:20px;">Booking ID: ${booking._id}</p>
    <p style="font-size:14px;color:#0e0e0e;padding-top:20px;">A booking has been ${status}.</p>
    <p style="font-size:14px;color:#0e0e0e;padding-top:20px;">Details:</p>
    <ul style="font-size:14px;color:#0e0e0e;">
      <li>Winery: ${booking.wineryName}</li>
      <li>Customer: ${booking.customerName}</li>
      <li>Date: ${new Date(booking.date).toLocaleDateString()}</li>
      <li>Time: ${booking.time}</li>
    </ul>
  `;
  return EmailTemplate({ content, subject: `Admin: Booking ${status} - ${booking._id}` });
};

// Send emails for a single winery booking
export async function sendBookingEmails(booking: any, winery: any, user: any, status: string) {
  try {
    // Validate inputs
    if (!user?.email) throw new Error("User email is missing");
    if (!winery?.wineryEmail) throw new Error(`Winery email is missing for winery ID: ${winery.wineryId}`);
    if (!winery?.datetime) throw new Error(`Datetime is missing for winery ID: ${winery.wineryId}`);

    const [date, time] = winery.datetime.split("T"); // Split ISO datetime
    if (!date || !time) throw new Error(`Invalid datetime format: ${winery.datetime}`);

    const emailData = {
      _id: booking._id,
      customerName: user.name || "Customer",
      customerEmail: user.email,
      wineryName: winery.wineryName || "Unknown Winery",
      wineryEmail: winery.wineryEmail,
      date: date,
      time: time.split(":").slice(0, 2).join(":"), // Extract HH:mm
    };

    // Fetch admin users
    const adminUsers = await UserModel.find({ role: "admin" }).select("email");
    if (!adminUsers.length) {
      console.warn("No admin users found for sending admin emails");
    }

    const emails = [
      {
        to: emailData.customerEmail,
        subject: `Booking ${status} - ${emailData.wineryName}`,
        html: getCustomerEmailTemplate(emailData, status),
      },
      {
        to: emailData.wineryEmail,
        subject: `Booking ${status} Notification`,
        html: getWineryEmailTemplate(emailData, status),
      },
      ...adminUsers.map((admin) => ({
        to: admin.email,
        subject: `Admin: Booking ${status} - ${emailData._id}`,
        html: getAdminEmailTemplate(emailData, status),
      })),
    ].filter(email => email.to); // Filter out any undefined emails

    const emailResults = await Promise.all(
      emails.map((email) =>
        transporter.sendMail({
          from: process.env.EMAIL_FROM,
          ...email,
        }).then((info) => ({ status: "success", to: email.to, messageId: info.messageId }))
          .catch((error) => ({ status: "error", to: email.to, error: error.message }))
      )
    );

    console.log("Email sending results:", emailResults);
    return emailResults;
  } catch (error: any) {
    console.error(`Error in sendBookingEmails for winery ID ${winery.wineryId}:`, error);
    return [{ status: "error", error: error.message || String(error) }];
  }
}