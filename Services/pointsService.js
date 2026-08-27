const { PointsLedger } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');

/**
 * Award points to a user.
 * @param {string} userId
 * @param {string} clubId
 * @param {number} amount - Positive for add, negative for deduction
 * @param {string} source - Source type enum
 * @param {string} reason
 * @param {Object} reference - { type, id }
 */
async function awardPoints(userId, clubId, amount, source, reason = '', reference = {}) {
  if (!amount) throw new Error('Invalid amount');

  const ledger = await PointsLedger.create({
    user_id: userId,
    club_id: clubId,
    amount,
    source,
    reason,
    reference_type: reference.type || null,
    reference_id: reference.id || null,
  });

  return ledger;
}

/**
 * Get points balance for a user (sum of all ledger entries)
 */
async function getPointsBalance(userId, clubId = null) {
  const where = { user_id: userId };
  if (clubId) where.club_id = clubId;

  const result = await PointsLedger.sum('amount', { where });
  return result || 0;
}

/**
 * Get points history for a user
 */
async function getPointsHistory(userId, { clubId, limit = 50, offset = 0 } = {}) {
  const where = { user_id: userId };
  if (clubId) where.club_id = clubId;

  const entries = await PointsLedger.findAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdat', 'DESC']],
  });

  const total = await PointsLedger.count({ where });
  return { entries, total };
}

module.exports = {
  awardPoints,
  getPointsBalance,
  getPointsHistory,
};
