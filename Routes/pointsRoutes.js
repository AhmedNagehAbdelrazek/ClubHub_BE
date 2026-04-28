const router = require('express').Router();
const pointsController = require('../Controllers/pointsController');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');

router.get('/points/balance', protect, ...pointsController.getBalance);
router.get('/points/history', protect, ...pointsController.getHistory);
router.post('/rewards/:rewardId/redeem', protect, ...pointsController.redeemReward);
router.get('/admin/redemptions/pending', protect, roleGuard(['super_admin', 'club_admin']), ...pointsController.getPendingRedemptions);
router.patch('/admin/redemptions/:redemptionId/decision', protect, roleGuard(['super_admin', 'club_admin']), ...pointsController.decideRedemption);

module.exports = router;
