const router = require('express').Router();
const clubController = require('../Controllers/clubController');
const { protect, roleGuard } = require('../middlewares/protect');

// Public endpoints
router.get('/', clubController.listClubs);
router.get('/:clubId', clubController.getClub);

// Super admin only
router.post('/', protect, roleGuard(['super_admin']), clubController.createClub);

// Update club (super_admin OR club_admin - controller checks)
router.patch('/:clubId', protect, clubController.updateClub);

// Link sport to club (super_admin only)
router.post('/:clubId/sports', protect, roleGuard(['super_admin']), clubController.linkSport);

module.exports = router;
