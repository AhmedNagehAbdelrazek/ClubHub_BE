const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const notificationService = require('../Services/notificationService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');

const sendNotificationRules = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  body('targetType').isIn(['user', 'club', 'global']),
  body('clubId').optional().isUUID(),
  body('userId').optional().isUUID(),
  body('title').notEmpty(),
  body('message').notEmpty(),
  body('data').optional().isObject(),
  validate,
  async (req, res, next) => {
    try {
      const { targetType, clubId, userId, title, message, data } = req.body;
      const notification = await notificationService.sendNotification(
        { targetType, clubId, userId },
        { title, message, data }
      );
      successResponse(res, notification, 201);
    } catch (err) {
      next(err);
    }
  },
];

const getMyNotifications = [protect, async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(req.user.id, req.query);
    successResponse(res, result.notifications, 200, result.meta);
  } catch (err) {
    next(err);
  }
}];

const markRead = [param('notificationId').isUUID(), protect, validate, async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(req.params.notificationId, req.user.id);
    successResponse(res, result, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = {
  sendNotificationRules,
  getMyNotifications,
  markRead,
};
