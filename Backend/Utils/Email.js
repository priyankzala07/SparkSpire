const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",        // SMTP server
  port: 587,                     // TLS port
  secure: false,                 // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL,    // your email
    pass: process.env.EMAIL_PASSWORD,      // app password (not your main password)
  },
});


const sendBookingEmail = async (email, userName, eventTitle) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
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
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendOTPEmail = async ( email, otp, type) => {
    try {
        const title = type === 'account_verification' ? 'Verify your Eventora Account' : 'Eventora Booking Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new Eventora account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        const mailOptions = {
            from: process.env.EMAIL,
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
    } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
}
};

module.exports = { sendBookingEmail, sendOTPEmail };
