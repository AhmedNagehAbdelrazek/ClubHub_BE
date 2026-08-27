const { validate } = require('../middlewares/validatorMiddleware');
const clubService = require('../Services/clubService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
const { createClubValidation, updateClubValidation, linkSportValidation } = require('../utils/validators/clubValidator');
const { param, body } = require('express-validator');
/**
 * POST /api/v1/clubs - Create club (super_admin)
 */
const createClub = [protect, roleGuard(['super_admin']), ...createClubValidation, validate, async (req, res, next) => {
  try {
    const club = await clubService.createClub(req.body, req.user);
    successResponse(res, club, 201);
  } catch (err) {
    next(err);
  }
}];

/**
 * GET /api/v1/clubs - List clubs (public)
 */
const listClubs = async (req, res, next) => {
  try {
    const result = await clubService.listClubs(req.query);
    successResponse(res, result.clubs, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/clubs/:clubId - Get club details
 */
const getClub = [param('clubId').isUUID(), validate, async (req, res, next) => {
  try {
    const club = await clubService.getClub(req.params.clubId);
    successResponse(res, club, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * PATCH /api/v1/clubs/:clubId - Update club
 */
const updateClub = [protect, ...updateClubValidation, validate, async (req, res, next) => {
  try {
    const club = await clubService.updateClub(req.params.clubId, req.body, req.user);
    successResponse(res, club, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * POST /api/v1/clubs/:clubId/sports - Link sport to club
 */
const linkSport = [protect, ...linkSportValidation, validate, async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { sportId } = req.body;
    const result = await clubService.linkSport(clubId, sportId, req.user);
    successResponse(res, result, 201);
  } catch (err) {
    next(err);
  }
}];

module.exports = { createClub, listClubs, getClub, updateClub, linkSport };
