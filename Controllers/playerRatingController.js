const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const playerRatingService = require('../Services/playerRatingService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');

const rateValidation = [
  protect,
  param('playerId').isUUID(),
  body('matchId').isUUID(),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be 1-5'),
  body('comment').optional().isString(),
  validate,
  async (req, res, next) => {
    try {
      const rating = await playerRatingService.ratePlayer(
        { matchId: req.body.matchId, playerId: req.params.playerId, stars: req.body.stars, comment: req.body.comment },
        req.user.id
      );
      successResponse(res, rating, 201);
    } catch (err) {
      next(err);
    }
  },
];

const getPlayerRatings = [param('playerId').isUUID(), protect, validate, async (req, res, next) => {
  try {
    const ratings = await playerRatingService.getPlayerRatings(req.params.playerId, req.user);
    successResponse(res, ratings, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = { rateValidation, getPlayerRatings };
