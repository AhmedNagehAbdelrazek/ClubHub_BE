const { body, param } = require('express-validator');

const createSurveyRules = [
  body('clubId').isUUID(),
  body('title').notEmpty(),
  body('isAnonymous').optional().isBoolean(),
  body('status').optional().isIn(['draft', 'published', 'closed']),
  body('startsAt').optional().isISO8601(),
  body('endsAt').optional().isISO8601(),
  body('questions').optional().isArray(),
];

const publishSurveyRules = [
  param('surveyId').isUUID(),
];

const submitResponseRules = [
  param('surveyId').isUUID(),
  body('answers').isArray(),
];

const faqRules = [
  body('clubId').isUUID(),
  body('question').notEmpty(),
  body('answer').notEmpty(),
];

const privateQuestionRules = [
  body('clubId').isUUID(),
  body('content').notEmpty(),
];

module.exports = {
  createSurveyRules,
  publishSurveyRules,
  submitResponseRules,
  faqRules,
  privateQuestionRules,
};
