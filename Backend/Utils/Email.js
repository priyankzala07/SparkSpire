const nodemailer = require("nodemailer");
require('dotenv').config(),
const dns = require("dns");

dotenv.config();

// Prefer IPv4 over IPv6 on networks without IPv6 to avoid ENETUNREACH
if (typeof dns.setDefaultResultOrder === "function") {
  try {
    dns.setDefaultResultOrder("ipv4first");
    console.log("🔧 DNS default result order set to ipv4first");
  } catch (e) {
    console.warn("⚠️ Could not set DNS result order:", e);
  }
}

// Check required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS is missing in environment variables.");
}
console.log(process.env.EMAIL_USER)
// Create transporter (Gmail SMTP only)
const transporterConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  family: 4, // Force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
};

console.log("🔧 Using Gmail SMTP (smtp.gmail.com)");

const transporter = nodemailer.createTransport(transporterConfig);

// Default From address
const defaultFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@example.com';

// Verify SMTP connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Verify Error:");
    console.error(error);
  } else {
    console.log("✅ SMTP server is ready to send emails.");
  }
});

// Booking Confirmation Email
const sendBookingEmail = async (email, userName, eventTitle) => {
  try {
    console.log(`📧 Sending booking confirmation to ${email}`);

    const mailOptions = {
      from: `"SparkSpire" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmed - ${eventTitle}`,
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Hello ${userName} 👋</h2>
          <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
          <p>Thank you for using SparkSpire.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Booking email sent successfully.");
    return true;
  } catch (error) {
    console.error("❌ Booking Email Error:");
    console.error(error);
    return false;
  }
};

// OTP Email
const sendOTPEmail = async (email, otp, type) => {
  try {
    console.log(`📧 Sending OTP to ${email}`);

    const title =
      type === "account_verification"
        ? "Verify Your SparkSpire Account"
        : "SparkSpire Booking Verification";

    const message =
      type === "account_verification"
        ? "Use the OTP below to verify your account."
        : "Use the OTP below to verify your booking.";

    const mailOptions = {
      from: `"SparkSpire" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: title,
      html: `
        <div style="font-family:Arial,sans-serif;text-align:center;padding:30px">
          <h2>${title}</h2>
          <p>${message}</p>

          <div
            style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              padding:20px;
              background:#f4f4f4;
              display:inline-block;
              border-radius:8px;
            "
          >
            ${otp}
          </div>

          <p style="margin-top:20px;color:#666">
            This OTP expires in 5 minutes.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ OTP Email Sent Successfully");
    return true;
  } catch (error) {
    console.error("❌ OTP Email Error:");
    console.error(error);
    return false;
  }
};

module.exports = {
  sendBookingEmail,
  sendOTPEmail,
};
