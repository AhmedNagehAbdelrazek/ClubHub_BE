const router = require('express').Router();
const adminController = require('../Controllers/adminController');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');

const requireAdmin = [protect, roleGuard(['super_admin', 'club_admin'])];

router.get('/stats/club/:clubId', requireAdmin, ...adminController.getClubStats);
router.get('/stats/global', protect, roleGuard(['super_admin']), ...adminController.getGlobalStats);
router.get('/pending', protect, ...adminController.getPendingActions);

module.exports = router;
