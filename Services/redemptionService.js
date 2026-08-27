const { Redemption, Reward, PointsLedger, Membership } = require('../Models');
const pointsService = require('./pointsService');
const { ApiErrors } = require('../utils/ApiError');

/**
 * Request redemption of a reward.
 * Deducts points immediately via ledger and creates pending redemption record.
 */
async function requestRedemption(userId, rewardId) {
  const reward = await Reward.findByPk(rewardId, { include: ['club'] });
  if (!reward) throw ApiErrors.notFound('Reward not found');
  if (!reward.is_active) throw ApiErrors.badRequest('Reward is no longer available');

  // Check user has enough points in that club
  const balance = await pointsService.getPointsBalance(userId, reward.club_id);
  if (balance < reward.points_cost) {
    throw ApiErrors.badRequest('Insufficient points');
  }

  // Deduct points (book entry)
  await pointsService.awardPoints(userId, reward.club_id, -reward.points_cost, 'redemption', `Redeemed reward: ${reward.name}`, { type: 'reward', id: rewardId });

  // Create redemption record
  const redemption = await Redemption.create({
    reward_id: rewardId,
    user_id: userId,
    club_id: reward.club_id,
    status: 'pending',
  });

  return redemption;
}

/**
 * Admin decision on redemption (approve/reject)
 */
async function decideRedemption(redemptionId, decision, adminId) {
  const redemption = await Redemption.findByPk(redemptionId, { include: ['reward', 'club'] });
  if (!redemption) throw ApiErrors.notFound('Redemption not found');
  if (redemption.status !== 'pending') throw ApiErrors.badRequest('Redemption already processed');

  if (decision !== 'approved' && decision !== 'rejected') {
    throw ApiErrors.badRequest('Invalid decision');
  }

  redemption.status = decision;
  redemption.decided_at = new Date();
  redemption.decided_by = adminId;
  await redemption.save();

  // If rejected, refund points
  if (decision === 'rejected') {
    await pointsService.awardPoints(redemption.user_id, redemption.club_id, redemption.reward.points_cost, 'manual', `Refund for rejected redemption: ${redemption.reward.name}`, { type: 'redemption', id: redemptionId });
  }

  return redemption;
}

/**
 * List pending redemptions for admin (club-specific)
 */
async function listPendingRedemptions(clubId) {
  const where = { status: 'pending' };
  if (clubId) where.club_id = clubId;

  const redemptions = await Redemption.findAll({
    where,
    include: [{ model: Reward, as: 'reward' }, { model: require('../Models/User'), as: 'user' }],
    order: [['requested_at', 'ASC']],
  });

  return redemptions;
}

module.exports = {
  requestRedemption,
  decideRedemption,
  listPendingRedemptions,
};
