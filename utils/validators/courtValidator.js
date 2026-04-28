const { body, param } = require('express-validator');

const createCourtValidation = [
  param('clubId').isUUID().withMessage('Invalid club ID'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Court name is required')
    .isLength({ min: 2, max: 100 }),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('hourlyPrice')
    .isFloat({ min: 0 })
    .withMessage('Hourly price must be non-negative'),
  body('supportedSportIds')
    .optional()
    .isArray()
    .withMessage('supportedSportIds must be an array'),
  body('surfaceType').optional().isString(),
  body('locationDescription').optional().isString(),
  body('isIndoor').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

const updateCourtValidation = [
  param('courtId').isUUID().withMessage('Invalid court ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('hourlyPrice').optional().isFloat({ min: 0 }),
  body('surfaceType').optional().isString(),
  body('locationDescription').optional().isString(),
  body('isIndoor').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
  body('supportedSportIds')
    .optional()
    .isArray()
    .withMessage('supportedSportIds must be an array'),
];

module.exports = {
  createCourtValidation,
  updateCourtValidation,
};
