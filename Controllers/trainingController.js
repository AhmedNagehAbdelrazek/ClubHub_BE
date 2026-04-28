const { param, body } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const trainingService = require('../Services/trainingService');
const { successResponse } = require('../utils/httpResponse');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
const { ApiErrors } = require('../utils/ApiError');

/**
 * GET /api/v1/trainings - List trainings (public)
 */
const listTrainings = async (req, res, next) => {
  try {
    const result = await trainingService.listTrainings(req.query);
    successResponse(res, result.trainings, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/trainings/:trainingId - Get training details
 */
const getTraining = [param('trainingId').isUUID(), validate, async (req, res, next) => {
  try {
    const training = await trainingService.getTraining(req.params.trainingId);
    successResponse(res, training, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * POST /api/v1/trainings - Create training (admin)
 */
const createTraining = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  body('clubId').isUUID(),
  body('courtId').isUUID(),
  body('sportId').isUUID(),
  body('title').notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('capacity').isInt({ min: 1 }),
  body('trainerUserId').optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const training = await trainingService.createTraining(req.body, req.user);
      successResponse(res, training, 201);
    } catch (err) {
      next(err);
    }
  },
];

/**
 * POST /api/v1/trainings/:trainingId/register - Register for training
 */
const registerForTraining = [param('trainingId').isUUID(), protect, validate, async (req, res, next) => {
  try {
    const reg = await trainingService.registerForTraining(req.params.trainingId, req.user.id);
    successResponse(res, reg, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * POST /api/v1/trainings/:trainingId/withdraw - Withdraw registration
 */
const withdrawFromTraining = [param('trainingId').isUUID(), protect, validate, async (req, res, next) => {
  try {
    const reg = await trainingService.withdrawFromTraining(req.params.trainingId, req.user.id);
    successResponse(res, reg, 200);
  } catch (err) {
    next(err);
  }
}];

/**
 * POST /api/v1/trainings/:trainingId/cancel - Cancel training (admin)
 */
const cancelTraining = [param('trainingId').isUUID(), protect, async (req, res, next) => {
  try {
    const training = await trainingService.cancelTraining(req.params.trainingId, req.user);
    successResponse(res, training, 200);
  } catch (err) {
    next(err);
  }
}];

module.exports = {
  listTrainings,
  getTraining,
  createTraining,
  registerForTraining,
  withdrawFromTraining,
  cancelTraining,
};
