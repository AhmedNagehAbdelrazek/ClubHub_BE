const router = require('express').Router();
const courtController = require('../Controllers/courtController');

// List courts in club (public)
router.get('/:clubId/courts', ...courtController.listCourts);

// Get court details (public)
router.get('/:courtId', ...courtController.getCourt);

// Create court (admin protected)
router.post('/:clubId/courts', ...courtController.createCourt);

// Update court (admin protected)
router.patch('/:courtId', ...courtController.updateCourt);

module.exports = router;
