const router = require('express').Router();
const playerRatingController = require('../Controllers/playerRatingController');

router.post('/players/:playerId/rate', ...playerRatingController.rateValidation);
router.get('/players/:playerId/ratings', ...playerRatingController.getPlayerRatings);

module.exports = router;
