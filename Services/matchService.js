const { Membership } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const { ROLES } = require('../config/constants');
const scheduleConflictService = require('./scheduleConflictService');

/**
 * Verify user is club admin for creating/updating match.
 */
async function assertMatchAdmin(user, clubId) {
  if (user.globalRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  const membership = await Membership.findOne({
    where: { user_id: user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' },
  });
  if (!membership) {
    throw ApiErrors.forbidden('Club admin access required for match management');
  }
  return true;
}

/**
 * Schedule a new match with conflict validation and snake-draft team generation.
 */
async function createMatch(data, user) {
  await assertMatchAdmin(user, data.clubId);
  await scheduleConflictService.assertNoConflict(data.courtId, data.start_time, data.end_time);
  // TODO: implement snake-draft utility
  throw new Error('Not implemented');
}

// Stub methods
module.exports = {
  assertMatchAdmin,
  createMatch,
  updateMatch: async (matchId, data, user) => { throw new Error('Not implemented'); },
  cancelMatch: async (matchId, user) => { throw new Error('Not implemented'); },
  completeMatch: async (matchId, result, user) => { throw new Error('Not implemented'); },
  getMatch: async (matchId) => { throw new Error('Not implemented'); },
  listMatches: async (filters) => { throw new Error('Not implemented'); },
};
