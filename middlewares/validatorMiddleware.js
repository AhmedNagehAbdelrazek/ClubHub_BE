const { validationResult } = require('express-validator');
const { ApiErrors } = require('../utils/ApiError');

/**
 * Middleware to process express-validator results.
 * Returns standardized 422 ValidationError envelope on failure.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formattedErrors = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
    value: err.value,
  }));

  const apiError = ApiErrors.validation('Validation failed');
  apiError.message = formattedErrors;

  // Attach details to error for potential logging
  next(apiError);
};

module.exports = { validate };
