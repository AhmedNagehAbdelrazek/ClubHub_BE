const router = require('express').Router();
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
const matchService = require('../Services/matchService');

// List matches (public or authenticated)
router.get('/', async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented' });
});

// Create match (admin only)
router.post('/', protect, roleGuard(['super_admin', 'club_admin']), async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented' });
});

// Register for a match (authenticated)
router.post('/:matchId/register', protect, async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented' });
});

module.exports = router;
