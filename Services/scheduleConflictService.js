const { Op } = require('sequelize');
const db = require('../Models');

/**
 * Get all occupancy conflicts for a given court and time range.
 * Checks across CourtBooking, Match, Training tables.
 *
 * @param {string} courtId
 * @param {Date} startTime
 * @param {Date} endTime
 * @param {Object} [options]
 * @param {Transaction} [options.transaction] - Sequelize transaction to run queries within.
 * @returns {Promise<Array>} List of conflicting records with type and id
 */
async function getConflicts(courtId, startTime, endTime, options = {}) {
  const conflicts = [];
  const { transaction } = options;

  const pushConflicts = (records) => {
    records.forEach((rec) => {
      conflicts.push({ id: rec.id, type: rec.constructor.name.toLowerCase().replace('book', 'book').replace('training', 'training'), data: rec.get({ plain: true }) });
    });
  };

  // Check CourtBooking
  if (db.CourtBooking) {
    const bookings = await db.CourtBooking.findAll({
      where: {
        court_id: courtId,
        status: 'confirmed',
        [Op.or]: [
          { start_time: { [Op.lt]: endTime }, end_time: { [Op.gt]: startTime } },
          { start_time: { [Op.gte]: startTime, [Op.lt]: endTime } },
          { end_time: { [Op.gt]: startTime, [Op.lte]: endTime } },
        ],
      },
      transaction,
    });
    pushConflicts(bookings);
  }

  // Check Match
  if (db.Match) {
    const matches = await db.Match.findAll({
      where: {
        court_id: courtId,
        status: 'scheduled',
        [Op.or]: [
          { start_time: { [Op.lt]: endTime }, end_time: { [Op.gt]: startTime } },
          { start_time: { [Op.gte]: startTime, [Op.lt]: endTime } },
          { end_time: { [Op.gt]: startTime, [Op.lte]: endTime } },
        ],
      },
      transaction,
    });
    pushConflicts(matches);
  }

  // Check Training
  if (db.Training) {
    const trainings = await db.Training.findAll({
      where: {
        court_id: courtId,
        status: 'scheduled',
        [Op.or]: [
          { start_time: { [Op.lt]: endTime }, end_time: { [Op.gt]: startTime } },
          { start_time: { [Op.gte]: startTime, [Op.lt]: endTime } },
          { end_time: { [Op.gt]: startTime, [Op.lte]: endTime } },
        ],
      },
      transaction,
    });
    pushConflicts(trainings);
  }

  return conflicts;
}

/**
 * Ensure no overlap exists; throws ApiError if conflict detected.
 */
async function assertNoConflict(courtId, startTime, endTime, options = {}) {
  const conflicts = await getConflicts(courtId, startTime, endTime, options);
  if (conflicts.length > 0) {
    const { ApiErrors } = require('../utils/ApiError');
    const conflictDetails = conflicts.map((c) => {
      // Determine type by model name in data
      const type = c.type || 'unknown';
      return `${type}(${c.id})`;
    }).join(', ');
    throw ApiErrors.conflict(`Court conflict with: ${conflictDetails}`);
  }
}

module.exports = {
  getConflicts,
  isCourtAvailable: async (courtId, startTime, endTime, opts) => {
    const conflicts = await getConflicts(courtId, startTime, endTime, opts);
    return conflicts.length === 0;
  },
  assertNoConflict,
};
