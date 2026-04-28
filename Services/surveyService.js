const { Survey, SurveyQuestion, SurveyResponse, FAQ, PrivateQuestion } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');

/**
 * CRUD for surveys (club_admin)
 */
async function createSurvey(data, user) {
  const { clubId, title, isAnonymous, status, startsAt, endsAt, questions = [] } = data;

  // Auth
  const Membership = require('../Models/Membership');
  if (user.globalRole !== 'super_admin') {
    const mem = await Membership.findOne({ where: { user_id: user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' } });
    if (!mem) throw ApiErrors.forbidden('Club admin required');
  }

  const survey = await Survey.create({
    club_id: clubId,
    title,
    is_anonymous: isAnonymous || false,
    status: status || 'draft',
    starts_at: startsAt || null,
    ends_at: endsAt || null,
  });

  // Create questions
  for (const q of questions) {
    await SurveyQuestion.create({
      survey_id: survey.id,
      type: q.type,
      prompt: q.prompt,
      options_json: q.options || null,
      order_index: q.orderIndex || 0,
      is_required: q.isRequired || false,
    });
  }

  return survey;
}

async function publishSurvey(surveyId, user) {
  const survey = await Survey.findByPk(surveyId);
  if (!survey) throw ApiErrors.notFound('Survey not found');

  if (user.globalRole !== 'super_admin') {
    const Membership = require('../Models/Membership');
    const mem = await Membership.findOne({ where: { user_id: user.id, club_id: survey.club_id, club_role: 'club_admin', status: 'approved' } });
    if (!mem) throw ApiErrors.forbidden('Club admin required');
  }

  if (survey.status === 'draft') {
    survey.status = 'published';
    await survey.save();
  }
  return survey;
}

async function getSurveyResponses(surveyId, user) {
  const survey = await Survey.findByPk(surveyId);
  if (!survey) throw ApiErrors.notFound('Survey not found');

  // Auth: only club_admin or super_admin can view responses
  if (user.globalRole !== 'super_admin') {
    const Membership = require('../Models/Membership');
    const mem = await Membership.findOne({ where: { user_id: user.id, club_id: survey.club_id, club_role: 'club_admin', status: 'approved' } });
    if (!mem) throw ApiErrors.forbidden('Club admin required');
  }

  const responses = await SurveyResponse.findAll({
    where: { survey_id: surveyId },
    include: [{ model: SurveyQuestion, as: 'question' }, { model: require('../Models/User'), as: 'user', attributes: ['id', 'name'] }],
    order: [['created_at', 'DESC']],
  });

  return responses;
}

/**
 * Submit survey response (authenticated user)
 */
async function submitSurveyResponse(surveyId, userId, answers) {
  const survey = await Survey.findByPk(surveyId);
  if (!survey) throw ApiErrors.notFound('Survey not found');
  if (survey.status !== 'published') throw ApiErrors.badRequest('Survey not open');

  // If not anonymous, check if already responded
  if (!survey.is_anonymous) {
    const existing = await SurveyResponse.findOne({ where: { survey_id: surveyId, user_id: userId } });
    if (existing) throw ApiErrors.conflict('Already responded to this survey');
  }

  // Create responses per answer
  for (const answer of answers) {
    const { questionId, valueText, valueNumber, valueJson } = answer;
    const question = await SurveyQuestion.findByPk(questionId);
    if (!question || question.survey_id !== surveyId) throw ApiErrors.badRequest('Invalid question');

    await SurveyResponse.create({
      survey_id: surveyId,
      question_id: questionId,
      user_id: survey.is_anonymous ? null : userId,
      value_text: valueText || null,
      value_number: valueNumber || null,
      value_json: valueJson || null,
    });
  }

  return { message: 'Response submitted' };
}

/**
 * FAQ and PrivateQuestion
 */
async function createFAQ(data, user) {
  const { clubId, question, answer, orderIndex } = data;
  if (user.globalRole !== 'super_admin') {
    const Membership = require('../Models/Membership');
    const mem = await Membership.findOne({ where: { user_id: user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' } });
    if (!mem) throw ApiErrors.forbidden('Club admin required');
  }
  return await FAQ.create({ club_id: clubId, question, answer, order_index: orderIndex || 0 });
}

async function listFAQs(clubId) {
  const faqs = await FAQ.findAll({ where: { club_id: clubId }, order: [['order_index', 'ASC']] });
  return faqs;
}

async function submitPrivateQuestion(clubId, userId, content) {
  return await PrivateQuestion.create({
    club_id: clubId,
    user_id: userId,
    content,
    status: 'pending',
  });
}

async function answerPrivateQuestion(questionId, answer, user) {
  const pq = await PrivateQuestion.findByPk(questionId, { include: ['club'] });
  if (!pq) throw ApiErrors.notFound('Question not found');
  if (user.globalRole !== 'super_admin') {
    const Membership = require('../Models/Membership');
    const mem = await Membership.findOne({ where: { user_id: user.id, club_id: pq.club_id, club_role: 'club_admin', status: 'approved' } });
    if (!mem) throw ApiErrors.forbidden('Club admin required');
  }
  pq.status = 'answered';
  pq.answer = answer;
  pq.answered_by = user.id;
  pq.answered_at = new Date();
  await pq.save();
  return pq;
}

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
