const { ApiErrors } = require('../utils/ApiError');
const { Membership } = require('../Models');

/**
 * Club scope guard.
 *
 * Ensures the requesting user has membership access to the specified club.
 * - For `super_admin`: allows any club (skips check)
 * - For `club_admin`: limits to clubs where they are admin; cross-club denied
 * - For `member`: limits to clubs where membership is approved
 *
 * Expects俱乐部 ID from route params: req.params.clubId or req.query.clubId
 */
const clubScopeGuard = (req, res, next) => {
  if (!req.user) {
    return next(ApiErrors.unauthorized('Authentication required'));
  }

  // Super admin bypasses all club checks
  if (req.user.globalRole === 'super_admin') {
    return next();
  }

  // Determine clubId from params or query
  const clubId = req.params.clubId || req.query.clubId;
  if (!clubId) {
    return next(new (require('../utils/ApiError').ApiError)('Club identifier required', 400, 'CLUB_ID_REQUIRED'));
  }

  // Check membership
  Membership.findOne({
    where: {
      user_id: req.user.id,
      club_id: clubId,
      status: 'approved',
    },
  })
    .then((membership) => {
      if (!membership) {
        return next(ApiErrors.forbidden('Club membership required'));
      }

      // Attach membership info to request for downstream use
      req.membership = membership;
      req.clubId = clubId;
      next();
    })
    .catch((err) => {
      next(ApiErrors.serverError('Failed to verify club membership'));
    });
};

module.exports = { clubScopeGuard };
