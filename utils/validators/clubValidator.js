const { body, param } = require('express-validator');

const createClubValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Club name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Club location is required'),
  body('logoUrl').optional().isURL().withMessage('Invalid logo URL'),
  body('settings').optional().isObject().withMessage('Settings must be an object'),
];

const updateClubValidation = [
  param('clubId').isUUID().withMessage('Invalid club ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('location').optional().trim().notEmpty(),
  body('logoUrl').optional().isURL(),
  body('settings').optional().isObject(),
];

const linkSportValidation = [
  param('clubId').isUUID(),
  body('sportId')
    .exists()
    .withMessage('sportId is required')
    .isUUID()
    .withMessage('Invalid sport ID format'),
];

module.exports = {
  createClubValidation,
  updateClubValidation,
  linkSportValidation,
};
