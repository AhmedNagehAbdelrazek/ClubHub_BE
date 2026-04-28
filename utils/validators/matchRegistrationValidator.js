const { param } = require('express-validator');

const registerMatchValidation = [
  param('matchId').isUUID().withMessage('Invalid match ID'),
];

const withdrawMatchValidation = [
  param('matchId').isUUID().withMessage('Invalid match ID'),
];

module.exports = {
  registerMatchValidation,
  withdrawMatchValidation,
};
