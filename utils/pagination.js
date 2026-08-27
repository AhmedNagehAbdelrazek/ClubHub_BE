/**
 * Pagination utility — parse query parameters for paginated endpoints.
 *
 * Returns: { page, limit, offset, limitMax }
 */

const parsePagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    limitMax: 100,
  };
};

/**
 * Build pagination metadata for response.
 */
const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
  };
};

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
