const { Op } = require('sequelize');
const db = require('../Models');

/**
 * Get all ocupancy conflicts for a given court and time range.
 *
 * Checks across all relevant tables: CourtBooking, Match, Training.
 * Only considers active/confirmed statuses.
 *
 * @param {string} courtId
 * @param {Date} startTime
 * @param {Date} endTime
 * @returns {Promise<Array>} List of conflicting records with type and id
 */
async function getConflicts(courtId, startTime, endTime) {
  const conflicts = [];

  // Helper to push conflicts with a type label
  const pushConflicts = (records, type) => {
    records.forEach((rec) => {
      conflicts.push({ id: rec.id, type, data: rec.get({ plain: true }) });
    });
  };

  // Check CourtBooking (if model exists)
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
    });
    pushConflicts(bookings, 'booking');
  }

  // Check Match (if model exists)
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
    });
    pushConflicts(matches, 'match');
  }

  // Check Training (if model exists)
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
    });
    pushConflicts(trainings, 'training');
  }

  return conflicts;
}

/**
 * Check if a court is available for the given time interval.
 * Returns true if no conflicts found.
 */
async function isCourtAvailable(courtId, startTime, endTime) {
  const conflicts = await getConflicts(courtId, startTime, endTime);
  return conflicts.length === 0;
}

/**
 * Ensure no overlap exists; throws ApiError if conflict detected.
 */
async function assertNoConflict(courtId, startTime, endTime) {
  const conflicts = await getConflicts(courtId, startTime, endTime);
  if (conflicts.length > 0) {
    const { ApiErrors } = require('../utils/ApiError');
    const conflictDetails = conflicts.map((c) => `${c.type}(${c.id})`).join(', ');
    throw ApiErrors.conflict(`Court conflict with: ${conflictDetails}`);
  }
}

module.exports = {
  getConflicts,
  isCourtAvailable,
  assertNoConflict,
};
