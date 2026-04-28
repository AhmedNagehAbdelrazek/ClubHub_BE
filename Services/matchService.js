const { Match, MatchRegistration, Court, Membership, sequelize } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const { ROLES } = require('../config/constants');
const scheduleConflictService = require('./scheduleConflictService');
const teamDraft = require('../utils/teamDraft');

/**
 * Verify user is club admin for creating/updating match.
 */
async function assertMatchAdmin(user, clubId) {
  if (user.globalRole === ROLES.SUPER_ADMIN) return true;
  const Membership = require('../Models/Membership');
  const membership = await Membership.findOne({
    where: { user_id: user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' },
  });
  if (!membership) throw ApiErrors.forbidden('Club admin access required for match management');
  return true;
}

/**
 * Schedule a new match with conflict validation and snake-draft team generation.
 */
async function createMatch(data, user) {
  const { clubId, courtId, sportId, name, startTime, endTime, requiredPlayers, registrationOpenTime } = data;

  await assertMatchAdmin(user, clubId);

  // Verify court and sport belong to club
  const court = await Court.findByPk(courtId);
  if (!court || court.club_id !== clubId) {
    throw ApiErrors.badRequest('Court does not belong to this club');
  }

  // Verify sport is supported by court (via court_supported_sports join)
  const sportSupported = await court.getSports({ where: { id: sportId } });
  if (sportSupported.length === 0) {
    throw ApiErrors.badRequest('Selected sport is not supported by this court');
  }

  // Conflict check
  await scheduleConflictService.assertNoConflict(courtId, new Date(startTime), new Date(endTime));

  // Create match
  const match = await Match.create({
    club_id: clubId,
    court_id: courtId,
    sport_id: sportId,
    name,
    start_time: startTime,
    end_time: endTime,
    required_players: requiredPlayers,
    registration_open_time: registrationOpenTime,
    status: 'scheduled',
  });

  return match;
}

/**
 * Update a match (limited fields allowed)
 */
async function updateMatch(matchId, data, user) {
  const match = await Match.findByPk(matchId);
  if (!match) throw ApiErrors.notFound('Match not found');

  await assertMatchAdmin(user, match.club_id);

  // Allow updates only to non-critical fields unless status transition
  if (data.name) match.name = data.name;
  if (data.start_time) match.start_time = data.start_time;
  if (data.end_time) match.end_time = data.end_time;
  if (data.status) {
    // Simple state transition validation
    if (!['scheduled', 'cancelled', 'postponed', 'completed'].includes(data.status)) {
      throw ApiErrors.badRequest('Invalid status');
    }
    match.status = data.status;
  }
  if (data.score_summary !== undefined) match.score_summary = data.score_summary;
  if (data.winner_team !== undefined) match.winner_team = data.winner_team;

  await match.save();
  return match;
}

/**
 * Cancel a match
 */
async function cancelMatch(matchId, user) {
  const match = await Match.findByPk(matchId);
  if (!match) throw ApiErrors.notFound('Match not found');
  await assertMatchAdmin(user, match.club_id);
  match.status = 'cancelled';
  await match.save();
  return match;
}

/**
 * Complete a match and record results
 */
async function completeMatch(matchId, result, user) {
  const match = await Match.findByPk(matchId);
  if (!match) throw ApiErrors.notFound('Match not found');
  await assertMatchAdmin(user, match.club_id);

  match.status = 'completed';
  if (result.winnerTeam) match.winner_team = result.winnerTeam;
  if (result.scoreSummary) match.score_summary = result.scoreSummary;
  await match.save();

  // Award points to participants? (US11 later)
  return match;
}

/**
 * Get match details with registrations
 */
async function getMatch(matchId) {
  const match = await Match.findByPk(matchId, {
    include: [
      { model: require('../Models/Court'), as: 'court' },
      { model: require('../Models/Sport'), as: 'sport' },
      { model: require('../Models/MatchRegistration'), as: 'registrations' },
    ],
  });
  if (!match) throw ApiErrors.notFound('Match not found');
  return match;
}

/**
 * List matches with optional filters
 */
async function listMatches(filters = {}) {
  const where = {};
  if (filters.clubId) where.club_id = filters.clubId;
  if (filters.status) where.status = filters.status;

  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const { count, rows } = await Match.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['start_time', 'ASC']],
    include: [
      { model: require('../Models/Court'), as: 'court' },
      { model: require('../Models/Sport'), as: 'sport' },
    ],
  });

  return {
    matches: rows,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Generate balanced teams from registered participants using snake-draft.
 * Returns two arrays of player IDs.
 */
async function generateTeams(matchId) {
  const match = await Match.findByPk(matchId, {
    include: [{ model: MatchRegistration, as: 'registrations', where: { status: 'main' } }],
  });
  if (!match) throw ApiErrors.notFound('Match not found');

  const players = match.registrations.map((reg) => reg.user_id);
  if (players.length < 2) throw ApiErrors.badRequest('Not enough players for teams');

  const { teamA, teamB } = teamDraft(players);
  return { teamA, teamB };
}

/**
 * Register current user for a match.
 * Handles waitlist promotion when capacity reached.
 */
async function registerForMatch(matchId, userId) {
  const match = await Match.findByPk(matchId, {
    include: [{ model: MatchRegistration, as: 'registrations' }],
  });
  if (!match) throw ApiErrors.notFound('Match not found');

  // Only allow registration if match is scheduled and registration open
  if (match.status !== 'scheduled') {
    throw ApiErrors.badRequest('Match is not open for registration');
  }
  if (new Date() < new Date(match.registration_open_time)) {
    throw ApiErrors.badRequest('Registration not yet open');
  }

  // Check existing registration
  const existing = await MatchRegistration.findOne({
    where: { match_id: matchId, user_id: userId },
  });
  if (existing) {
    if (existing.status === 'main') {
      throw ApiErrors.conflict('Already registered for this match');
    }
    if (existing.status === 'withdrawn') {
      // Reactivate if within policy (e.g., re-join waitlist)
      existing.status = 'waiting';
      await existing.save();
      // Attempt promotion immediately
      return await promoteWaitlist(matchId);
    }
  }

  const mainCount = match.registrations.filter((r) => r.status === 'main').length;

  if (mainCount < match.required_players) {
    // Direct registration
    const registration = await MatchRegistration.create({
      match_id: matchId,
      user_id: userId,
      status: 'main',
      registration_time: new Date(),
    });
    return registration;
  } else {
    // Waitlist
    const registration = await MatchRegistration.create({
      match_id: matchId,
      user_id: userId,
      status: 'waiting',
      registration_time: new Date(),
    });
    return registration;
  }
}

/**
 * When a registration is cancelled or withdrawn, promote next waitlisted user.
 */
async function promoteWaitlist(matchId) {
  const match = await Match.findByPk(matchId, {
    include: [{ model: MatchRegistration, as: 'registrations', where: { status: 'waiting' }, order: [['registration_time', 'ASC']] }],
  });
  if (!match) return;

  const mainCount = match.registrations.filter((r) => r.status === 'main').length;
  if (mainCount >= match.required_players) return; // No space

  // Promote the earliest waitlisted user
  const next = match.registrations[0];
  if (next) {
    next.status = 'main';
    await next.save();
    // Recursively check if more spots opened (e.g., if required_players increased)
    await promoteWaitlist(matchId);
  }
}

/**
 * Withdraw from a match registration.
 */
async function withdrawRegistration(matchId, userId) {
  const registration = await MatchRegistration.findOne({
    where: { match_id: matchId, user_id: userId, status: 'main' },
  });
  if (!registration) throw ApiErrors.notFound('Active registration not found');

  registration.status = 'withdrawn';
  registration.withdrawn_at = new Date();
  await registration.save();

  // Trigger waitlist promotion
  await promoteWaitlist(matchId);

  return registration;
}

module.exports = {
  assertMatchAdmin,
  createMatch,
  updateMatch,
  cancelMatch,
  completeMatch,
  getMatch,
  listMatches,
  generateTeams,
  registerForMatch,
  withdrawRegistration,
};
