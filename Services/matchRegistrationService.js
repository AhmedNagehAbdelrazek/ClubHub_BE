const { Match, MatchRegistration } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const { sequelize } = require('../Models');

/**
 * Register a user for a match, handling waitlist promotion.
 */
async function registerForMatch(matchId, userId) {
  const match = await Match.findByPk(matchId, {
    include: [{ model: MatchRegistration, as: 'registrations' }],
  });
  if (!match) throw ApiErrors.notFound('Match not found');

  if (match.status !== 'scheduled') throw ApiErrors.badRequest('Match closed for registration');

  const now = new Date();
  if (now < new Date(match.registration_open_time)) {
    throw ApiErrors.badRequest('Registration not yet open');
  }

  // Check for existing registration
  const existing = await MatchRegistration.findOne({ where: { match_id: matchId, user_id: userId } });
  if (existing) {
    if (existing.status === 'main') throw ApiErrors.conflict('Already registered');
    if (existing.status === 'withdrawn') {
      // Re-join waitlist
      existing.status = 'waiting';
      await existing.save();
      return await promoteWaitlist(matchId);
    }
  }

  const mainCount = match.registrations.filter((r) => r.status === 'main').length;

  if (mainCount < match.required_players) {
    const reg = await MatchRegistration.create({
      match_id: matchId,
      user_id: userId,
      status: 'main',
      registration_time: now,
    });
    return reg;
  } else {
    const reg = await MatchRegistration.create({
      match_id: matchId,
      user_id: userId,
      status: 'waiting',
      registration_time: now,
    });
    return reg;
  }
}

/**
 * Withdraw from a match.
 */
async function withdrawFromMatch(matchId, userId) {
  const registration = await MatchRegistration.findOne({
    where: { match_id: matchId, user_id: userId, status: 'main' },
  });
  if (!registration) throw ApiErrors.notFound('Active registration not found');

  registration.status = 'withdrawn';
  registration.withdrawn_at = new Date();
  await registration.save();

  // Waitlist promotion
  await promoteWaitlist(matchId);

  return registration;
}

/**
 * Promote earliest waitlisted users when spots open.
 */
async function promoteWaitlist(matchId) {
  const match = await Match.findByPk(matchId, {
    include: [
      {
        model: MatchRegistration,
        as: 'registrations',
        where: { status: 'waiting' },
        order: [['registration_time', 'ASC']],
      },
    ],
  });
  if (!match) return;

  const mainCount = match.registrations.filter((r) => r.status === 'main').length;
  if (mainCount >= match.required_players) return;

  // Promote earliest waitlist
  const next = match.registrations[0];
  if (next) {
    next.status = 'main';
    await next.save();
    // Recursively promote until full or no more waitlist
    await promoteWaitlist(matchId);
  }
}

/**
 * Get all registrations for a match (admin only)
 */
async function getMatchRegistrations(matchId) {
  const registrations = await MatchRegistration.findAll({
    where: { match_id: matchId },
    include: [{ model: require('../Models/User'), as: 'user' }],
    order: [
      ['status', 'ASC'],
      ['registration_time', 'ASC'],
    ],
  });
  return registrations;
}

/**
 * Record a penalty for withdrawal after deadline (future extension placeholder)
 */
async function recordPenalty(matchId, userId, reason = 'withdrawal') {
  // Future: deduct points, log to pointsLedger, etc.
  // Placeholder
  return { message: 'Penalty recorded', userId, matchId, reason };
}

module.exports = {
  registerForMatch,
  withdrawFromMatch,
  promoteWaitlist,
  getMatchRegistrations,
  recordPenalty,
};
