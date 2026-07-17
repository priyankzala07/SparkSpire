const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const isEmailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS );

const transporter = nodemailer.createTransport({
  host: smtp.gmail.com,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("Server is ready to take messages");
  }
});




const sendBookingEmail = async (email, userName, eventTitle) => {
    try {
        if (!isEmailConfigured()) {
            console.warn('Email delivery skipped because SMTP configuration is incomplete.');
            return false;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing Eventora.</p>
      `
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to', email);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendOTPEmail = async (email, otp, type) => {
    try {
        if (!isEmailConfigured()) {
            console.warn('OTP email delivery skipped because SMTP configuration is incomplete.');
            return false;
        }

        const title = type === 'account_verification' ? 'Verify your Eventora Account' : 'Eventora Booking Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Eventora account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        console.log(`Sending OTP email to ${email} for ${type} with OTP: ${otp}`);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: title,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email} for ${type}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = { sendBookingEmail, sendOTPEmail };
