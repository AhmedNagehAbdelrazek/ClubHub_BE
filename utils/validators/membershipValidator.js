const { body, param } = require('express-validator');

/**
 * Apply for membership validation
 */
const applyMembershipValidation = [
  body('clubId')
    .notEmpty()
    .withMessage('Club ID is required')
    .isUUID()
    .withMessage('Invalid club ID format'),
];

/**
 * Membership decision validation (approve/reject/deactivate)
 */
const decisionValidation = [
  param('membershipId')
    .notEmpty()
    .withMessage('Membership ID is required')
    .isUUID()
    .withMessage('Invalid membership ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'rejected', 'deactivated'])
    .withMessage('Invalid status value'),
];

module.exports = {
  applyMembershipValidation,
  decisionValidation,
};
