const router = require('express').Router();
const membershipController = require('../Controllers/membershipController');
const { protect } = require('../middlewares/protect');

// All routes require authentication
router.use(protect);

// POST /memberships - apply to club
router.post('/', ...membershipController.applyForMembership);

// GET /memberships - list (user's own OR admin's club filtered via query)
router.get('/', ...membershipController.getMemberships);

// PATCH /memberships/:membershipId/decision - admin decision
router.patch('/:membershipId/decision', ...membershipController.membershipDecision);

module.exports = router;
