const router = require('express').Router();
const matchController = require('../Controllers/matchController');

// Public endpoints
router.get('/', matchController.listMatches);
router.get('/:matchId', ...matchController.getMatch);

// Admin only
router.post('/', ...matchController.createMatch);

// User registration
router.post('/:matchId/register', ...matchController.registerForMatch);
router.post('/:matchId/withdraw', ...matchController.withdrawFromMatch);

// Complete match (admin)
router.post('/:matchId/complete', ...matchController.completeMatch);

// Update match (admin)
router.patch('/:matchId', ...matchController.updateMatch);

module.exports = router;
