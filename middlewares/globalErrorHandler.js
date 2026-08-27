const { ApiError } = require('../utils/ApiError');

/**
 * Global error handler middleware.
 * Produces standardized error envelope: { status: 'error', message, code? }
 *
 * Handles:
 * - ApiError instances (structured application errors)
 * - Sequelize validation errors → 422 ValidationError
 * - JWT errors → 401 Unauthorized
 * - Unhandled errors → 500 InternalServerError
 */
const globalErrorHandler = (err, req, res, next) => {
  // If already an ApiError, use its envelope
  if (err instanceof Error && err.constructor.name === 'ApiError') {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const apiErr = new (require('../utils/ApiError').ApiError)(
      err.errors[0]?.message || 'Validation failed',
      422,
      'VALIDATION_ERROR'
    );
    return res.status(422).json(apiErr.toJSON());
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const apiErr = new (require('../utils/ApiError').ApiError)(
      err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
      401,
      'INVALID_TOKEN'
    );
    return res.status(401).json(apiErr.toJSON());
  }

  // Fallback: generic server error
  const fallbackErr = new (require('../utils/ApiError').ApiError)(
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    500,
    'INTERNAL_ERROR'
  );

  // Include stack in development
  if (process.env.NODE_ENV === 'development') {
    fallbackErr.stack = err.stack;
  }

  res.status(500).json(fallbackErr.toJSON());
};

module.exports = globalErrorHandler;
