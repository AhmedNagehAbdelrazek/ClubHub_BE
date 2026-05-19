const { validate } = require('../middlewares/validatorMiddleware');
const courtService = require('../Services/courtService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');
const { createCourtValidation, updateCourtValidation } = require('../utils/validators/courtValidator');

/**
 * List courts in club - public
 */
const listCourts = [
  param('clubId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const courts = await courtService.listCourts(req.params.clubId);
      successResponse(res, courts, 200);
    } catch (err) {
      next(err);
    }
  },
];

/**
 * Get court details - public
 */
const getCourt = [
  param('courtId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const court = await courtService.getCourt(req.params.courtId);
      successResponse(res, court, 200);
    } catch (err) {
      next(err);
    }
  },
];

/**
 * Create court
 */
const createCourt = [protect, ...createCourtValidation, validate, async (req, res, next) => {
  try {
    const data = { ...req.body, clubId: req.params.clubId };
    const court = await courtService.createCourt(data, req.user);
    successResponse(res, court, 201);
  } catch (err) {
    next(err);
  }
}];

/**
 * Update court
 */
const updateCourt = [protect, ...updateCourtValidation, validate, async (req, res, next) => {
  try {
    const court = await courtService.updateCourt(req.params.courtId, req.body, req.user);
    successResponse(res, court, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = { listCourts, getCourt, createCourt, updateCourt };
