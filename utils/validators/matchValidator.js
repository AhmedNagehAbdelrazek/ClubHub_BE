const { body, param } = require('express-validator');

const createMatchValidation = [
  param('clubId').isUUID().withMessage('Invalid club ID'), // from route param
  body('courtId')
    .exists()
    .withMessage('courtId is required')
    .isUUID()
    .withMessage('Invalid court ID'),
  body('sportId')
    .exists()
    .withMessage('sportId is required')
    .isUUID()
    .withMessage('Invalid sport ID'),
  body('name')
    .exists()
    .withMessage('Match name is required')
    .trim()
    .isLength({ min: 2, max: 200 }),
  body('startTime')
    .exists()
    .withMessage('startTime is required')
    .isISO8601()
    .withMessage('Invalid startTime'),
  body('endTime')
    .exists()
    .withMessage('endTime is required')
    .isISO8601()
    .withMessage('Invalid endTime')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('endTime must be after startTime');
      }
      return true;
    }),
  body('requiredPlayers')
    .exists()
    .withMessage('requiredPlayers is required')
    .isInt({ min: 2 })
    .withMessage('requiredPlayers must be at least 2'),
  body('registrationOpenTime')
    .exists()
    .withMessage('registrationOpenTime is required')
    .isISO8601()
    .withMessage('Invalid registrationOpenTime'),
];

const updateMatchValidation = [
  param('matchId').isUUID().withMessage('Invalid match ID'),
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('status').optional().isIn(['scheduled', 'cancelled', 'postponed', 'completed']),
  body('scoreSummary').optional().isString(),
  body('winnerTeam').optional().isString(),
];

const registerMatchValidation = [
  param('matchId').isUUID().withMessage('Invalid match ID'),
];

module.exports = {
  createMatchValidation,
  updateMatchValidation,
  registerMatchValidation,
};
