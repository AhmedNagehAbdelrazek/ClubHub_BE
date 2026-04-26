const jwt = require('jsonwebtoken');
const { ApiErrors } = require('../utils/ApiError');

/**
 * Protect middleware — validates JWT bearer token and attaches user info to req.user.
 *
 * Expects Authorization header: Bearer <token>
 *
 * On success: req.user = { id, phone, globalRole }
 * On failure: calls next(err) with ApiError (401)
 */
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiErrors.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user payload to request
    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      globalRole: decoded.globalRole || 'user',
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiErrors.unauthorized('Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(ApiErrors.unauthorized('Invalid token'));
    }
    // Unexpected error
    return next(ApiErrors.serverError('Authentication failed'));
  }
};

module.exports = { protect };
