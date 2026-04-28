const { PlayerRating, Match, User, Membership } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');

/**
 * Create a player rating (only raters who participated in the match)
 */
async function ratePlayer(data, raterId) {
  const { matchId, playerId, stars, comment } = data;

  // Validate match exists and is completed
  const match = await Match.findByPk(matchId, { include: ['registrations'] });
  if (!match) throw ApiErrors.notFound('Match not found');
  if (match.status !== 'completed') throw ApiErrors.badRequest('Can only rate after match completes');

  // Ensure rater was a participant in the match
  const participant = match.registrations.find((r) => r.user_id === raterId && r.status === 'main');
  if (!participant) throw ApiErrors.forbidden('Only match participants can rate players');

  // Ensure player being rated was also a participant
  const targetParticipant = match.registrations.find((r) => r.user_id === playerId && r.status === 'main');
  if (!targetParticipant) throw ApiErrors.badRequest('Rated user was not a participant in this match');

  // Prevent self-rating
  if (raterId === playerId) throw ApiErrors.badRequest('Cannot rate yourself');

  // Prevent duplicate rating from same rater for same player in same match
  const existing = await PlayerRating.findOne({ where: { match_id: matchId, player_id: playerId, rated_by: raterId } });
  if (existing) throw ApiErrors.conflict('Already rated this player for this match');

  const rating = await PlayerRating.create({
    club_id: match.club_id,
    match_id: matchId,
    player_id: playerId,
    rated_by: raterId,
    stars,
    comment: comment || null,
  });

  return rating;
}

/**
 * Get ratings for a specific player (visible to the player and admins)
 */
async function getPlayerRatings(playerId, requestingUser) {
  // Authorization: player can see own ratings; others need club-admin access in the relevant club.
  const ratings = await PlayerRating.findAll({
    where: { player_id: playerId },
    include: [
      { model: Match, as: 'match' },
      { model: User, as: 'rater' },
    ],
    order: [['created_at', 'DESC']],
  });

  if (requestingUser.id === playerId || requestingUser.globalRole === 'super_admin') {
    return ratings;
  }

  const adminMemberships = await Membership.findAll({
    where: {
      user_id: requestingUser.id,
      status: 'approved',
      club_role: 'club_admin',
    },
    attributes: ['club_id'],
  });
  const allowedClubIds = new Set(adminMemberships.map((membership) => membership.club_id));

  const filtered = ratings.filter((rating) => allowedClubIds.has(rating.club_id));

  return filtered;
}

module.exports = {
  ratePlayer,
  getPlayerRatings,
};
