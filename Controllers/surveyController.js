const { body, param } = require('express-validator');
const { validate } = require('../middlewares/validatorMiddleware');
const { protect } = require('../middlewares/protect');
const { roleGuard } = require('../middlewares/roleGuard');
const surveyService = require('../Services/surveyService');
const { successResponse } = require('../utils/httpResponse');

const createSurvey = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  body('clubId').isUUID(),
  body('title').notEmpty(),
  body('isAnonymous').optional().isBoolean(),
  body('status').optional().isIn(['draft', 'published', 'closed']),
  body('questions').optional().isArray(),
  validate,
  async (req, res, next) => {
    try {
      const survey = await surveyService.createSurvey(req.body, req.user);
      successResponse(res, survey, 201);
    } catch (err) {
      next(err);
    }
  },
];

const publishSurvey = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  param('surveyId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const survey = await surveyService.publishSurvey(req.params.surveyId, req.user);
      successResponse(res, survey, 200);
    } catch (err) {
      next(err);
    }
  },
];

const getSurveyResponses = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  param('surveyId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const responses = await surveyService.getSurveyResponses(req.params.surveyId, req.user);
      successResponse(res, responses, 200);
    } catch (err) {
      next(err);
    }
  },
];

const submitSurveyResponse = [
  protect,
  param('surveyId').isUUID(),
  body('answers').isArray(),
  validate,
  async (req, res, next) => {
    try {
      const result = await surveyService.submitSurveyResponse(req.params.surveyId, req.user.id, req.body.answers || []);
      successResponse(res, result, 201);
    } catch (err) {
      next(err);
    }
  },
];

const createFAQ = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  body('clubId').isUUID(),
  body('question').notEmpty(),
  body('answer').notEmpty(),
  body('orderIndex').optional().isInt({ min: 0 }),
  validate,
  async (req, res, next) => {
    try {
      const faq = await surveyService.createFAQ(req.body, req.user);
      successResponse(res, faq, 201);
    } catch (err) {
      next(err);
    }
  },
];

const listFAQs = [
  param('clubId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const faqs = await surveyService.listFAQs(req.params.clubId);
      successResponse(res, faqs, 200);
    } catch (err) {
      next(err);
    }
  },
];

const submitPrivateQuestion = [
  protect,
  param('clubId').isUUID(),
  body('content').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const question = await surveyService.submitPrivateQuestion(req.params.clubId, req.user.id, req.body.content);
      successResponse(res, question, 201);
    } catch (err) {
      next(err);
    }
  },
];

const answerPrivateQuestion = [
  protect,
  roleGuard(['super_admin', 'club_admin']),
  param('questionId').isUUID(),
  body('answer').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const question = await surveyService.answerPrivateQuestion(req.params.questionId, req.body.answer, req.user);
      successResponse(res, question, 200);
    } catch (err) {
      next(err);
    }
  },
];

module.exports = {
  createSurvey,
  publishSurvey,
  getSurveyResponses,
  submitSurveyResponse,
  createFAQ,
  listFAQs,
  submitPrivateQuestion,
  answerPrivateQuestion,
};