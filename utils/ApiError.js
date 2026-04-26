/**
 * ApiError — standardized error envelope.
 *
 * Envelope format:
 * { status: 'error', message: string, code?: string }
 *
 * Maps HTTP status codes and application error codes to consistent responses.
 */

class ApiError extends Error {
  /**
   * @param {string} message Human-readable error message
   * @param {number} statusCode HTTP status code
   * @param {string} [code] Optional application-specific error code
   */
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = 'error';
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Build the response envelope.
   */
  toJSON() {
    const envelope = {
      status: this.status,
      message: this.message,
    };

    if (this.code) {
      envelope.code = this.code;
    }

    return envelope;
  }
}

/**
 * Factory functions for common error types.
 */
const ApiErrors = {
  badRequest: (message = 'Bad request', code = 'BAD_REQUEST') => new ApiError(message, 400, code),
  unauthorized: (message = 'Unauthorized', code = 'UNAUTHORIZED') => new ApiError(message, 401, code),
  forbidden: (message = 'Forbidden', code = 'FORBIDDEN') => new ApiError(message, 403, code),
  notFound: (message = 'Not found', code = 'NOT_FOUND') => new ApiError(message, 404, code),
  conflict: (message = 'Conflict', code = 'CONFLICT') => new ApiError(message, 409, code),
  validation: (message = 'Validation error', code = 'VALIDATION_ERROR') => new ApiError(message, 422, code),
  serverError: (message = 'Internal server error', code = 'INTERNAL_ERROR') => new ApiError(message, 500, code),
};

module.exports = {
  ApiError,
  ApiErrors,
};
