const express = require('express');
const router = express.Router();
const { bookEvent, confirmBooking, getMyBookings, cancelBooking, sendBookingOTP } = require('../Controllers/booking.Controller');
const { protect, admin } = require('../Middleware/Auth.middleware');

router.post('/send-otp', protect, sendBookingOTP);
router.post('/', protect, bookEvent);
router.put('/:id/confirm', protect, admin, confirmBooking);
router.get('/my', protect, getMyBookings);
router.delete('/:id', protect, cancelBooking);

module.exports = router;