const router = require('express').Router();
const eventController = require('../Controllers/eventController');

router.get('/', eventController.listEvents);
router.get('/:eventId', ...eventController.getEvent);
router.post('/', ...eventController.createEvent);
router.post('/:eventId/register', ...eventController.registerEvent);
router.post('/:eventId/cancel', ...eventController.cancelEventRegistration);

module.exports = router;
