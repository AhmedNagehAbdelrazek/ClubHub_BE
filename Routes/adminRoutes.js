const router = require('express').Router();
const adminController = require('../Controllers/adminController');

// Admin-only stats endpoints
router.get('/stats/club/:clubId', ...adminController.getClubStats);
router.get('/stats/global', ...adminController.getGlobalStats);
router.get('/pending', ...adminController.getPendingActions);

module.exports = router;
