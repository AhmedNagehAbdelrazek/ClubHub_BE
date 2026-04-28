const { body, param } = require('express-validator');

const createBookingValidation = [
  body('courtId')
    .exists()
    .withMessage('courtId is required')
    .isUUID()
    .withMessage('Invalid court ID'),
  body('startTime')
    .exists()
    .withMessage('startTime is required')
    .isISO8601()
    .withMessage('Invalid startTime format'),
  body('endTime')
    .exists()
    .withMessage('endTime is required')
    .isISO8601()
    .withMessage('Invalid endTime format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('endTime must be after startTime');
      }
      return true;
    }),
  body('sportId').optional().isUUID().withMessage('Invalid sport ID'),
  body('notes').optional().isString(),
  body('requiresAdminApproval').optional().isBoolean(),
];

const updateBookingValidation = [
  param('bookingId').isUUID().withMessage('Invalid booking ID'),
  body('status')
    .exists()
    .withMessage('status is required')
    .isIn(['cancelled', 'completed'])
    .withMessage('Invalid status value'),
];

const getBookingValidation = [
  param('bookingId').isUUID().withMessage('Invalid booking ID'),
];

module.exports = {
  createBookingValidation,
  updateBookingValidation,
  getBookingValidation,
};
