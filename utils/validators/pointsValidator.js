const { body, param } = require('express-validator');

const rewardRedeemValidation = [
  param('rewardId').isUUID().withMessage('Invalid reward ID'),
];

const redemptionDecisionValidation = [
  param('redemptionId').isUUID(),
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
];

const getHistoryValidation = [
  // query: clubId optional, limit, offset
];

module.exports = {
  rewardRedeemValidation,
  redemptionDecisionValidation,
  getHistoryValidation,
};
