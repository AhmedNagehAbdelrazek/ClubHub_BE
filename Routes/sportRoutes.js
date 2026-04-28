const router = require('express').Router();
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
const { Sport } = require('../Models');

// POST /api/v1/sports - Create sport (super_admin)
router.post('/', protect, roleGuard(['super_admin']), async (req, res, next) => {
  try {
    const { name, iconUrl, playersPerTeam } = req.body;
    const sport = await Sport.create({
      name,
      icon_url: iconUrl || null,
      players_per_team: playersPerTeam || 2,
    });
    res.status(201).json({ status: 'success', data: sport });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sports - List all sports (public)
router.get('/', async (req, res, next) => {
  try {
    const sports = await Sport.findAll();
    res.status(200).json({ status: 'success', data: sports });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
