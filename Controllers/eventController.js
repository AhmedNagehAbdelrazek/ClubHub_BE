const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const eventService = require('../Services/eventService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');

const createEventValidation = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  body('clubId').isUUID(),
  body('courtId').optional().isUUID(),
  body('title').notEmpty(),
  body('description').optional().isString(),
  body('locationText').optional().isString(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('capacity').optional().isInt({ min: 1 }),
  body('paymentStatusMode').optional().isIn(['free', 'paid', 'donation']),
  validate,
  async (req, res, next) => {
    try {
      const event = await eventService.createEvent(req.body, req.user);
      successResponse(res, event, 201);
    } catch (err) {
      next(err);
    }
  },
];

const createEvent = createEventValidation;

const getEvent = [param('eventId').isUUID(), validate, async (req, res, next) => {
  try {
    const event = await eventService.getEvent(req.params.eventId);
    successResponse(res, event, 200);
  } catch (err) {
    next(err);
  }
}];

const listEvents = async (req, res, next) => {
  try {
    const result = await eventService.listEvents(req.query);
    successResponse(res, result.events, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const registerEvent = [param('eventId').isUUID(), protect, validate, async (req, res, next) => {
  try {
    const reg = await eventService.registerForEvent(req.params.eventId, req.user.id);
    successResponse(res, reg, 200);
  } catch (err) {
    next(err);
  }
}];

const cancelEventRegistration = [param('eventId').isUUID(), protect, validate, async (req, res, next) => {
  try {
    const reg = await eventService.cancelEventRegistration(req.params.eventId, req.user.id);
    successResponse(res, reg, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = {
  createEvent,
  getEvent,
  listEvents,
  registerEvent,
  cancelEventRegistration,
};
