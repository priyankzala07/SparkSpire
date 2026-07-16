const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'pending' },
    paymentStatus: { type: String, enum: ['paid', 'not_paid'], default: 'not_paid' },
    amount: { type: Number, required: true },
    bookedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// A user can have one booking record per event. Cancelled bookings are reused
// when the user books the event again.
bookingSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
