const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ["account_verification", "event_booking"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
});

const OTPModel = mongoose.models.otp || mongoose.model("otp", OtpSchema);

module.exports = OTPModel;