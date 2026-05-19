const router = require('express').Router();
const bookingController = require('../Controllers/bookingController');
const { protect } = require('../middlewares/protect');

// List bookings (authenticated)
router.get('/', protect, bookingController.listBookings);

// Create booking (authenticated)
router.post('/', protect, bookingController.createBooking);

// Get single booking (authenticated)
router.get('/:bookingId', protect, bookingController.getBooking);

// Update booking status (authenticated)
router.patch('/:bookingId', protect, bookingController.updateBooking);

module.exports = router;
