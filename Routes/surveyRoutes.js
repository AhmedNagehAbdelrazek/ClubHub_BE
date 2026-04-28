const router = require('express').Router();
const surveyController = require('../Controllers/surveyController');

router.post('/', ...surveyController.createSurvey);
router.patch('/:surveyId/publish', ...surveyController.publishSurvey);
router.get('/:surveyId/responses', ...surveyController.getSurveyResponses);
router.post('/:surveyId/responses', ...surveyController.submitSurveyResponse);

router.post('/faqs', ...surveyController.createFAQ);
router.get('/clubs/:clubId/faqs', ...surveyController.listFAQs);
router.post('/clubs/:clubId/private-questions', ...surveyController.submitPrivateQuestion);
router.patch('/private-questions/:questionId/answer', ...surveyController.answerPrivateQuestion);

module.exports = router;