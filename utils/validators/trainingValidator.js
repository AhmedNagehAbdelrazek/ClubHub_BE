const { body, param } = require('express-validator');

const createTrainingValidation = [
  param('clubId').isUUID(),
  body('courtId').isUUID(),
  body('sportId').isUUID(),
  body('title').notEmpty().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().isString(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601().custom((value, { req }) => {
    if (new Date(value) <= new Date(req.body.startTime)) throw new Error('endTime must be after startTime');
    return true;
  }),
  body('capacity').isInt({ min: 1 }),
  body('trainerUserId').optional().isUUID(),
];

const trainingIdValidation = [param('trainingId').isUUID()];

module.exports = {
  createTrainingValidation,
  trainingIdValidation,
};
