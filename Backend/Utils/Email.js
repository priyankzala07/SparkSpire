const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const dns = require("dns");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (typeof dns.setDefaultResultOrder === "function") {
  try {
    dns.setDefaultResultOrder("ipv4first");
    console.log("DNS set to IPv4 first");
  } catch (err) {
    console.error("DNS Error:", err);
  }
}

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true";
const emailFrom = process.env.EMAIL_FROM || emailUser || "no-reply@sparkspire.com";

if (!emailUser || !emailPass) {
  console.error("EMAIL_USER or EMAIL_PASS is missing. Email delivery will be disabled until these are configured in production.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  requireTLS: true,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Failed:", error);
  } else {
    console.log("SMTP Connected Successfully", success);
  }
});

const sendBookingEmail = async (email, userName, eventTitle) => {
  try {
    if (!emailUser || !emailPass) {
      console.error("Email delivery skipped because credentials are missing.");
      return false;
    }

    console.log(`Sending booking email to ${email}`);

    await transporter.sendMail({
      from: `"SparkSpire" <${emailFrom}>`,
      to: email,
      subject: `Booking Confirmed - ${eventTitle}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>Hello ${userName}!</h2>
          <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
          <p>Thank you for choosing <b>SparkSpire</b>.</p>
          <hr>
          <p style="color:gray;font-size:14px">This is an automated email. Please do not reply.</p>
        </div>
      `,
    });

    console.log("Booking email sent successfully.");
    return true;
  } catch (err) {
    console.error("Booking Email Error");
    console.error(err);
    return false;
  }
};

const sendOTPEmail = async (email, otp, type) => {
  try {
    if (!emailUser || !emailPass) {
      console.error("Email delivery skipped because credentials are missing.");
      return false;
    }

    console.log(`Sending OTP to ${email}`);

    const subject =
      type === "account_verification"
        ? "Verify Your SparkSpire Account"
        : "SparkSpire Booking Verification";

    const message =
      type === "account_verification"
        ? "Use the OTP below to verify your account."
        : "Use the OTP below to verify your booking.";

    await transporter.sendMail({
      from: `"SparkSpire" <${emailFrom}>`,
      to: email,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;text-align:center;padding:30px">
          <h2>${subject}</h2>
          <p>${message}</p>
          <div style="display:inline-block;padding:20px 30px;font-size:34px;font-weight:bold;letter-spacing:8px;background:#f3f3f3;border-radius:8px;margin:20px 0;">
            ${otp}
          </div>
          <p>This OTP expires in <b>5 minutes</b>.</p>
          <hr>
          <p style="color:gray;font-size:14px">If you didn't request this OTP, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log("OTP email sent successfully.");
    return true;
  } catch (err) {
    console.error("OTP Email Error");
    console.error(err);
    return false;
  }
};

module.exports = {
  sendBookingEmail,
  sendOTPEmail,
};
