const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
const { validate } = require('../middlewares/validatorMiddleware');
const membershipService = require('../Services/membershipService');
const { successResponse } = require('../utils/httpResponse');
const { ApiErrors } = require('../utils/ApiError');
const { applyMembershipValidation, decisionValidation } = require('../utils/validators/membershipValidator');
const { ROLES } = require('../config/constants');

/**
 * POST /api/v1/memberships
 * Authenticated user applies to join a club.
 */
const applyForMembership = [protect, ...applyMembershipValidation, validate, async (req, res, next) => {
  try {
    const { clubId } = req.body;
    const userId = req.user.id;
    const membership = await membershipService.applyForMembership(userId, clubId);
    successResponse(res, membership, 201);
  } catch (err) {
    next(err);
  }
}];

/**
 * PATCH /api/v1/memberships/:membershipId/decision
 * Admin (club_admin or super_admin) approves/rejects/deactivates membership.
 */
const membershipDecision = [protect, ...decisionValidation, validate, async (req, res, next) => {
  try {
    const { membershipId } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    const membership = await require('../Models/Membership').findByPk(membershipId);
    if (!membership) throw ApiErrors.notFound('Membership not found');

    // Ensure admin has rights on that club
    await membershipService.assertClubAdminAccess(req.user, membership.club_id);

    const updated = await membershipService.decideMembership(membershipId, status, adminId);
    successResponse(res, updated, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * GET /api/v1/memberships
 * List memberships:
 *   - For regular users: their own memberships.
 *   - For admins (with clubId query): memberships for that club.
 */
const getMemberships = [protect, async (req, res, next) => {
  try {
    const { clubId, status } = req.query;

    // Super admin can list all memberships without clubId
    if (!clubId && req.user.globalRole === ROLES.SUPER_ADMIN) {
      const memberships = await membershipService.getAllMemberships({ status });
      return successResponse(res, memberships, 200);
    }

    // Regular user without clubId -> own memberships
    if (!clubId) {
      const memberships = await membershipService.getUserMemberships(req.user.id);
      return successResponse(res, memberships, 200);
    }

    // Admin request for a club
    await membershipService.assertClubAdminAccess(req.user, clubId);
    const memberships = await membershipService.getClubMemberships(clubId, { status });
    successResponse(res, memberships, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = {
  applyForMembership,
  membershipDecision,
  getMemberships,
};
