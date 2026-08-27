const { param, body, validationResult } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const matchService = require('../Services/matchService');
const matchRegistrationService = require('../Services/matchRegistrationService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
const { ApiErrors } = require('../utils/ApiError');
const {
  createMatchValidation,
  updateMatchValidation,
  registerMatchValidation,
} = require('../utils/validators/matchValidator');
const { withdrawMatchValidation } = require('../utils/validators/matchRegistrationValidator');

/**
 * List matches (public)
 */
const listMatches = async (req, res, next) => {
  try {
    const result = await matchService.listMatches(req.query);
    successResponse(res, result.matches, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

/**
 * Create match (admin)
 */
const createMatch = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  ...createMatchValidation,
  validate,
  async (req, res, next) => {
    try {
      const match = await matchService.createMatch(req.body, req.user);
      successResponse(res, match, 201);
    } catch (err) {
      next(err);
    }
  },
];

/**
 * Get match details (public)
 */
const getMatch = [param('matchId').isUUID(), validate, async (req, res, next) => {
  try {
    const match = await matchService.getMatch(req.params.matchId);
    successResponse(res, match, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * Update match (admin)
 */
const updateMatch = [protect, param('matchId').isUUID(), ...updateMatchValidation, validate, async (req, res, next) => {
  try {
    const match = await matchService.updateMatch(req.params.matchId, req.body, req.user);
    successResponse(res, match, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * Register for a match (authenticated)
 */
const registerForMatch = [...registerMatchValidation, protect, validate, async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const registration = await matchRegistrationService.registerForMatch(matchId, req.user.id);
    successResponse(res, registration, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * Withdraw from a match registration
 */
const withdrawFromMatch = [...withdrawMatchValidation, protect, validate, async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const registration = await matchRegistrationService.withdrawFromMatch(matchId, req.user.id);
    successResponse(res, registration, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * Complete match (admin)
 */
const completeMatch = [protect, param('matchId').isUUID(), body('winnerTeam').optional().isString(), body('scoreSummary').optional().isString(), validate, async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const result = { winnerTeam: req.body.winnerTeam, scoreSummary: req.body.scoreSummary };
    const match = await matchService.completeMatch(matchId, result, req.user);
    successResponse(res, match, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = {
  listMatches,
  createMatch,
  getMatch,
  updateMatch,
  registerForMatch,
  withdrawFromMatch,
  completeMatch,
};
