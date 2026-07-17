const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const dns = require("dns");

dotenv.config();

if (typeof dns.setDefaultResultOrder === "function") {
  try {
    dns.setDefaultResultOrder("ipv4first");
    console.log("DNS set to IPv4 first");
  } catch (err) {
    console.error("DNS Error:", err);
  }
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("EMAIL_USER or EMAIL_PASS is missing.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP Connection Failed");
    console.error(error);
  } else {
    console.log("Gmail SMTP Connected Successfully");
  }
});

const sendBookingEmail = async (email, userName, eventTitle) => {
  try {
    console.log(`Sending booking email to ${email}`);

    await transporter.sendMail({
      from: `"SparkSpire" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmed - ${eventTitle}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px">
          <h2>Hello ${userName} ??</h2>
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
      from: `"SparkSpire" <${process.env.EMAIL_USER}>`,
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
