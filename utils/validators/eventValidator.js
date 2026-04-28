const { body, param } = require('express-validator');

const createEventValidation = [
  body('clubId').isUUID(),
  body('courtId').optional().isUUID(),
  body('title').notEmpty().trim().isLength({ min: 2, max: 200 }),
  body('description').optional().isString(),
  body('locationText').optional().isString(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601().custom((value, { req }) => {
    if (new Date(value) <= new Date(req.body.startTime)) throw new Error('endTime must be after startTime');
    return true;
  }),
  body('capacity').optional().isInt({ min: 1 }),
  body('paymentStatusMode').optional().isIn(['free', 'paid', 'donation']),
];

const eventIdValidation = [param('eventId').isUUID()];

module.exports = {
  createEventValidation,
  eventIdValidation,
};
