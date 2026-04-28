const router = require('express').Router();
const notificationController = require('../Controllers/notificationController');

router.post('/', ...notificationController.sendNotificationRules);
router.get('/me', ...notificationController.getMyNotifications);
router.patch('/:notificationId/read', ...notificationController.markRead);

module.exports = router;