/**
 * Standardized success response helper.
 * All endpoints should return responses in the format:
 * { status: 'success', data: <payload> }
 */

const successResponse = (res, data, statusCode = 200) => {
  const response = {
    status: 'success',
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Paginated success response helper.
 * Adds pagination metadata.
 */
const paginatedResponse = (res, data, meta, statusCode = 200) => {
  const response = {
    status: 'success',
    data,
    meta,
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  paginatedResponse,
};
