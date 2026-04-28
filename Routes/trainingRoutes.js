const router = require('express').Router();
const trainingController = require('../Controllers/trainingController');

router.get('/', trainingController.listTrainings);
router.get('/:trainingId', ...trainingController.getTraining);
router.post('/', ...trainingController.createTraining);
router.post('/:trainingId/register', ...trainingController.registerForTraining);
router.post('/:trainingId/withdraw', ...trainingController.withdrawFromTraining);
router.post('/:trainingId/cancel', ...trainingController.cancelTraining);

module.exports = router;
