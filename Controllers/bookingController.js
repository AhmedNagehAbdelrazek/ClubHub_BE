const { validate } = require('../middlewares/validatorMiddleware');
const bookingService = require('../Services/bookingService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');
const { ApiErrors } = require('../utils/ApiError');
const { createBookingValidation, updateBookingValidation, getBookingValidation } = require('../utils/validators/bookingValidator');

/**
 * List bookings
 */
const listBookings = [protect, async (req, res, next) => {
  try {
    const result = await bookingService.listBookings({ ...req.query, userId: req.user.id });
    successResponse(res, result.bookings, 200, result.meta);
  } catch (err) {
    next(err);
  }
}];

/**
 * Create booking
 */
const createBooking = [...createBookingValidation, protect, validate, async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user);
    successResponse(res, booking, 201);
  } catch (err) {
    next(err);
  }
}];

/**
 * Get single booking
 */
const getBooking = [...getBookingValidation, protect, validate, async (req, res, next) => {
  try {
    const booking = await bookingService.getBooking(req.params.bookingId);
    // Authorization check
    if (booking.user_id !== req.user.id && req.user.globalRole !== 'super_admin') {
      const Membership = require('../Models/Membership');
      const admin = await Membership.findOne({
        where: { user_id: req.user.id, club_id: booking.club_id, club_role: 'club_admin', status: 'approved' },
      });
      if (!admin) throw ApiErrors.forbidden('Not authorized');
    }
    successResponse(res, booking, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * Update booking (cancel/complete)
 */
const updateBooking = [...updateBookingValidation, protect, validate, async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    let updated;
    if (status === 'cancelled') {
      updated = await bookingService.cancelBooking(bookingId, req.user);
    } else {
      updated = await bookingService.completeBooking(bookingId, req.user);
    }
    successResponse(res, updated, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = { listBookings, createBooking, getBooking, updateBooking };
