const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const pointsService = require('../Services/pointsService');
const redemptionService = require('../Services/redemptionService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
/**
 * GET /api/v1/points/balance
 * Get current user's points balance (optionally by club)
 */
const getBalance = [protect, async (req, res, next) => {
  try {
    const { clubId } = req.query;
    const balance = await pointsService.getPointsBalance(req.user.id, clubId || null);
    successResponse(res, { balance }, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * GET /api/v1/points/history
 * Get points transaction history for user
 */
const getHistory = [protect, async (req, res, next) => {
  try {
    const { clubId, limit, offset } = req.query;
    const result = await pointsService.getPointsHistory(req.user.id, { clubId, limit, offset });
    successResponse(res, result, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * POST /api/v1/rewards/:rewardId/redeem
 * Request redemption of a reward
 */
const redeemReward = [protect, param('rewardId').isUUID(), async (req, res, next) => {
  try {
    const redemption = await redemptionService.requestRedemption(req.user.id, req.params.rewardId);
    successResponse(res, redemption, 201);
  } catch (err) {
    next(err);
  }
}];

/**
 * PATCH /api/v1/admin/redemptions/:redemptionId/decision
 * Admin approve/reject redemption
 */
const decideRedemption = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  param('redemptionId').isUUID(),
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid decision'),
  validate,
  async (req, res, next) => {
    try {
      const { redemptionId } = req.params;
      const { status } = req.body;

      // If club_admin, ensure the redemption belongs to their club
      if (req.user.globalRole !== 'super_admin') {
        const redemption = await require('../Models/Redemption').findByPk(redemptionId);
        if (!redemption) throw ApiErrors.notFound('Redemption not found');
        // Check club admin membership
        const Membership = require('../Models/Membership');
        const mem = await Membership.findOne({
          where: { user_id: req.user.id, club_id: redemption.club_id, club_role: 'club_admin', status: 'approved' },
        });
        if (!mem) throw ApiErrors.forbidden('Not authorized');
      }

      const result = await redemptionService.decideRedemption(redemptionId, status, req.user.id);
      successResponse(res, result, 200);
    } catch (err) {
      next(err);
    }
  },
];

/**
 * GET /api/v1/admin/redemptions/pending
 * List pending redemptions (admin)
 */
const getPendingRedemptions = [protect, roleGuard(['super_admin', 'club_admin']), async (req, res, next) => {
  try {
    const { clubId } = req.query;
    // For club_admin, restrict to own club
    if (req.user.globalRole !== 'super_admin') {
      const Membership = require('../Models/Membership');
      // we may not have a specific clubId query param; we need to list all pending for clubs where user is admin
      // Implement: fetch memberships of admin, then filter
      const memberships = await Membership.findAll({
        where: { user_id: req.user.id, club_role: 'club_admin', status: 'approved' },
      });
      const clubIds = memberships.map((m) => m.club_id);
      const redemptions = await redemptionService.listPendingRedemptions(null).then((list) => list.filter((r) => clubIds.includes(r.club_id)));
      return successResponse(res, redemptions, 200);
    }
    const redemptions = await redemptionService.listPendingRedemptions(clubId || null);
    successResponse(res, redemptions, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = {
  getBalance,
  getHistory,
  redeemReward,
  decideRedemption,
  getPendingRedemptions,
};
