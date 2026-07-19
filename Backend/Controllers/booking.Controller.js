const mongoose = require('mongoose');
const Event = require('../Models/Events.model');
const Booking = require('../Models/Booking.model');
const OTPModel = require('../Models/Otp.model');
const { sendBookingEmail, sendOTPEmail } = require('../Utils/Email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        await OTPModel.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
        await OTPModel.create({ email: req.user.email, code: otp, action: 'event_booking' });

        sendOTPEmail(req.user.email, otp, 'event_booking')
            .then(() => console.log(`OTP email dispatch started for ${req.user.email}`))
            .catch((error) => console.error('Background OTP email failed:', error));

        res.json({
            message: 'OTP generated successfully. Please check your email shortly.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

const bookEvent = async (req, res) => {
    try {
const { eventId, otp } = req.body;
        // Verify OTP explicitly before proceeding
        const validOTP = await OTPModel.findOne({ email: req.user.email, code : otp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }
        if (!mongoose.isValidObjectId(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
        }
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        const booking = existingBooking
            ? await Booking.findByIdAndUpdate(
                existingBooking._id,
                {
                    status: 'pending',
                    paymentStatus: 'not_paid',
                    amount: event.ticketPrice,
                    bookedAt: new Date()
                },
                { new: true, runValidators: true }
            )
            : await Booking.create({
                userId: req.user.id,
                eventId,
                status: 'pending',
                paymentStatus: 'not_paid',
                amount: event.ticketPrice
            });

        await OTPModel.deleteOne({ _id: validOTP._id }); // cleanup

       return res.status(201).json({ message: 'Booking request submitted', booking });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Already booked or pending' });
      }
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        if (paymentStatus && !['paid', 'not_paid'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }

        const booking = await Booking.findOne({ _id: req.params.id, status: 'pending' })
            .populate('userId')
            .populate('eventId');

        if (!booking) {
            const existingBooking = await Booking.findById(req.params.id);
            return res.status(existingBooking ? 400 : 404).json({
                message: existingBooking ? 'Booking has already been processed' : 'Booking not found'
            });
        }

        const event = booking.eventId;
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available' });
        }

        booking.status = 'confirmed';
        booking.paymentStatus = paymentStatus || 'paid';
        await booking.save();

        event.availableSeats -= 1;
        await event.save();

        res.json({
            message: 'Booking confirmed successfully',
            booking: await booking.populate('userId').populate('eventId')
        });

        sendBookingEmail(booking.userId.email, booking.userId.name, event.title);
    } catch (error) {
        console.error('Confirm Booking Error:', error);
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';
        booking.status = 'cancelled';
        await booking.save();

        if (wasConfirmed) {
            await Event.findByIdAndUpdate(booking.eventId, { $inc: { availableSeats: 1 } });
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { bookEvent, confirmBooking, getMyBookings, cancelBooking, sendBookingOTP }