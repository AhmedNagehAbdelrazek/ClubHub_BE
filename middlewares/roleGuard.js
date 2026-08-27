const { ApiErrors } = require('../utils/ApiError');

/**
 * Role-based access guard.
 *
 * Usage:
 *   router.get('/admin', roleGuard(['super_admin']), handler);
 *
 * Checks req.user.globalRole against allowedRoles array.
 */
const roleGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiErrors.unauthorized('Authentication required'));
    }

    const hasRole = allowedRoles.includes(req.user.globalRole);
    if (!hasRole) {
      return next(ApiErrors.forbidden('Insufficient privileges'));
    }

    next();
  };
};

module.exports = { roleGuard };
