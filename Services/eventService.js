const { Event, EventParticipant, Court, Club } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const scheduleConflictService = require('./scheduleConflictService');
const { sequelize } = require('../Models');

/**
 * Create an event (club admin or super_admin)
 */
async function createEvent(data, user) {
  const { clubId, courtId, title, startTime, endTime, capacity, paymentStatusMode, description, locationText } = data;

  // Auth check
  const Membership = require('../Models/Membership');
  if (user.globalRole !== 'super_admin') {
    const mem = await Membership.findOne({
      where: { user_id: user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' },
    });
    if (!mem) throw ApiErrors.forbidden('Club admin access required');
  }

  // Optional: verify court belongs to club if provided
  if (courtId) {
    const court = await Court.findByPk(courtId);
    if (!court || court.club_id !== clubId) throw ApiErrors.badRequest('Court not in this club');
  }

  // No conflict check for events? Usually events might not conflict with court bookings unless they use court. If courtId set, maybe conflict applies.
  if (courtId) {
    await scheduleConflictService.assertNoConflict(courtId, new Date(startTime), new Date(endTime));
  }

  const event = await Event.create({
    club_id: clubId,
    court_id: courtId || null,
    title,
    description: description || null,
    location_text: locationText || null,
    start_time: startTime,
    end_time: endTime,
    capacity,
    payment_status_mode: paymentStatusMode || 'free',
    status: 'scheduled',
  });

  return event;
}

/**
 * Get an event by ID
 */
async function getEvent(eventId) {
  const event = await Event.findByPk(eventId, {
    include: [{ model: Court, as: 'court' }, { model: require('../Models/Club'), as: 'club' }],
  });
  if (!event) throw ApiErrors.notFound('Event not found');
  return event;
}

/**
 * List events
 */
async function listEvents(filters = {}) {
  const where = {};
  if (filters.clubId) where.club_id = filters.clubId;
  if (filters.status) where.status = filters.status;

  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const { count, rows } = await Event.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['start_time', 'ASC']],
    include: [{ model: require('../Models/Club'), as: 'club' }],
  });

  return {
    events: rows,
    meta: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) },
  };
}

/**
 * Register for an event
 */
async function registerForEvent(eventId, userId) {
  const event = await Event.findByPk(eventId, { include: [{ model: EventParticipant, as: 'participants' }] });
  if (!event) throw ApiErrors.notFound('Event not found');
  if (event.status !== 'scheduled') throw ApiErrors.badRequest('Event closed');

  // Capacity check
  if (event.capacity) {
    const mainCount = event.participants.filter((p) => p.status === 'main').length;
    if (mainCount >= event.capacity) {
      // Waitlist
      const existing = await EventParticipant.findOne({ where: { event_id: eventId, user_id: userId } });
      if (existing) {
        if (existing.status === 'main') throw ApiErrors.conflict('Already registered');
        // Already waiting; return existing
        return existing;
      }
      return await EventParticipant.create({
        event_id: eventId,
        user_id: userId,
        status: 'waiting',
      });
    }
  }

  // Direct registration
  const existing = await EventParticipant.findOne({ where: { event_id: eventId, user_id: userId } });
  if (existing) {
    if (existing.status === 'main') throw ApiErrors.conflict('Already registered');
    existing.status = 'main';
    await existing.save();
    return existing;
  }

  return await EventParticipant.create({
    event_id: eventId,
    user_id: userId,
    status: 'main',
  });
}

/**
 * Cancel event participation
 */
async function cancelEventRegistration(eventId, userId) {
  const event = await Event.findByPk(eventId, { include: [{ model: EventParticipant, as: 'participants' }] });
  if (!event) throw ApiErrors.notFound('Event not found');

  const reg = event.participants.find((participant) => participant.user_id === userId && participant.status === 'main');
  if (!reg) throw ApiErrors.notFound('Active registration not found');

  reg.status = 'cancelled';
  await reg.save();

  // Promote waitlist if capacity available
  if (event.capacity) {
    const waitingParticipant = await EventParticipant.findOne({
      where: { event_id: eventId, status: 'waiting' },
      order: [['created_at', 'ASC']],
    });

    if (waitingParticipant) {
      waitingParticipant.status = 'main';
      await waitingParticipant.save();
    }
  }
  return reg;
}

module.exports = {
  createEvent,
  getEvent,
  listEvents,
  registerForEvent,
  cancelEventRegistration,
};
