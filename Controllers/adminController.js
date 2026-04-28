const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
const adminService = require('../Services/adminService');
const { successResponse } = require('../utils/httpResponse');

const requireAdmin = [protect, roleGuard(['super_admin', 'club_admin'])];

/**
 * GET /api/v1/admin/stats/club/:clubId
 * Get aggregated stats for a specific club (admin)
 */
const getClubStats = [requireAdmin, async (req, res, next) => {
  try {
    const { clubId } = req.params;
    // Super admin can get any club; club admin limited to their own clubs? we'll just allow if super or if club admin of that club.
    if (req.user.globalRole !== 'super_admin') {
      // Verify admin membership for clubId
      const Membership = require('../Models/Membership');
      const mem = await Membership.findOne({
        where: { user_id: req.user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' },
      });
      if (!mem) throw new Error('Forbidden');
    }
    const stats = await adminService.getClubStats(clubId);
    successResponse(res, stats, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * GET /api/v1/admin/stats/global
 * Global stats (super_admin only)
 */
const getGlobalStats = [protect, roleGuard(['super_admin']), async (req, res, next) => {
  try {
    const stats = await adminService.getGlobalStats();
    successResponse(res, stats, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * GET /api/v1/admin/pending
 * List pending reviews (memberships, redemptions) requiring admin attention
 */
const getPendingActions = [protect, async (req, res, next) => {
  try {
    const items = await adminService.getPendingActions(req.user);
    successResponse(res, items, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = {
  getClubStats,
  getGlobalStats,
  getPendingActions,
};
