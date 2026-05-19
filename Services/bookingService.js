const { Court, CourtBooking, Membership } = require('../Models');
const scheduleConflictService = require('./scheduleConflictService');
const { ApiErrors } = require('../utils/ApiError');
const { sequelize } = require('../Models');

/**
 * Verify user membership in club
 */
async function assertBookingAccess(user, clubId) {
  const membership = await Membership.findOne({
    where: { user_id: user.id, club_id: clubId, status: 'approved' },
  });
  if (!membership) {
    throw ApiErrors.forbidden('Club membership required to book');
  }
}

/**
 * Create a court booking with transactional conflict checks.
 */
async function createBooking(data, user) {
  const { courtId, startTime, endTime, notes, requires_admin_approval = false } = data;

  if (new Date(startTime) >= new Date(endTime)) {
    throw ApiErrors.badRequest('endTime must be after startTime');
  }

  // Start transaction
  const t = await sequelize.transaction();

  try {
    // Lock the court row to prevent concurrent conflicting bookings
    const court = await Court.findByPk(courtId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!court) {
      await t.rollback();
      throw ApiErrors.notFound('Court not found');
    }

    // Verify court is active
    if (!court.is_active) {
      await t.rollback();
      throw ApiErrors.forbidden('Court is not active');
    }

    // Verify user membership in the club
    await assertBookingAccess(user, court.club_id);

    // Conflict check within same transaction
    await scheduleConflictService.assertNoConflict(courtId, new Date(startTime), new Date(endTime), { transaction: t });

    // Create booking
    const booking = await CourtBooking.create(
      {
        club_id: court.club_id,
        court_id: courtId,
        user_id: user.id,
        sport_id: data.sportId || null,
        start_time: startTime,
        end_time: endTime,
        status: 'confirmed',
        notes: notes || null,
        requires_admin_approval: requires_admin_approval,
      },
      { transaction: t }
    );

    await t.commit();
    return booking;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * Cancel a booking (user or admin).
 */
async function cancelBooking(bookingId, user) {
  const booking = await CourtBooking.findByPk(bookingId);
  if (!booking) throw ApiErrors.notFound('Booking not found');

  // Authorization: user is owner, club_admin of the booking's club, or super_admin
  if (booking.user_id !== user.id) {
    // Check if user is club admin for booking's club
    if (user.globalRole !== 'super_admin') {
      const Membership = require('../Models/Membership');
      const adminMembership = await Membership.findOne({
        where: {
          user_id: user.id,
          club_id: booking.club_id,
          club_role: 'club_admin',
          status: 'approved',
        },
      });
      if (!adminMembership) {
        throw ApiErrors.forbidden('Not authorized to cancel this booking');
      }
    }
  }

  // Only allowed if status is confirmed
  if (booking.status !== 'confirmed') {
    throw ApiErrors.badRequest('Cannot cancel a booking that is not confirmed');
  }

  booking.status = 'cancelled';
  await booking.save();
  return booking;
}

/**
 * Complete a booking (user or admin marks as done).
 */
async function completeBooking(bookingId, user) {
  const booking = await CourtBooking.findByPk(bookingId);
  if (!booking) throw ApiErrors.notFound('Booking not found');

  // Authorization similar to cancel, but allow both owner and club admin/super_admin
  if (booking.user_id !== user.id && user.globalRole !== 'super_admin') {
    const Membership = require('../Models/Membership');
    const adminMembership = await Membership.findOne({
      where: {
        user_id: user.id,
        club_id: booking.club_id,
        club_role: 'club_admin',
        status: 'approved',
      },
    });
    if (!adminMembership) {
      throw ApiErrors.forbidden('Not authorized to complete this booking');
    }
  }

  if (booking.status !== 'confirmed') {
    throw ApiErrors.badRequest('Only confirmed bookings can be completed');
  }

  booking.status = 'completed';
  await booking.save();

  // TODO: Award points if club has bookingPointsEnabled (US16)
  return booking;
}

/**
 * Get booking by ID.
 */
async function getBooking(bookingId) {
  const booking = await CourtBooking.findByPk(bookingId, {
    include: [{ model: require('../Models/Court'), as: 'court' }],
  });
  if (!booking) throw ApiErrors.notFound('Booking not found');
  return booking;
}

/**
 * List bookings with optional filters.
 */
async function listBookings(filters = {}) {
  const where = {};
  if (filters.clubId) where.club_id = filters.clubId;
  if (filters.userId) where.user_id = filters.userId;
  if (filters.status) where.status = filters.status;

  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const { count, rows } = await CourtBooking.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['start_time', 'DESC']],
    include: [
      { model: Court, as: 'court' },
      { model: require('../Models/User'), as: 'user' },
    ],
  });

  return {
    bookings: rows,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

module.exports = {
  assertBookingAccess,
  createBooking,
  cancelBooking,
  completeBooking,
  getBooking,
  listBookings,
};
