const { Training, TrainingRegistration, Court, Club } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const scheduleConflictService = require('./scheduleConflictService');
const { sequelize } = require('../Models');

/**
 * Create a training session (admin of club)
 */
async function createTraining(data, user) {
  const { clubId, courtId, sportId, title, startTime, endTime, capacity, trainerUserId } = data;

  // Verify club admin
  const Membership = require('../Models/Membership');
  const membership = await Membership.findOne({
    where: { user_id: user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' },
  });
  if (!membership && user.globalRole !== 'super_admin') {
    throw ApiErrors.forbidden('Club admin access required');
  }

  // Validate court belongs to club
  const court = await Court.findByPk(courtId);
  if (!court || court.club_id !== clubId) throw ApiErrors.badRequest('Invalid court for this club');

  // Conflict check
  await scheduleConflictService.assertNoConflict(courtId, new Date(startTime), new Date(endTime));

  const training = await Training.create({
    club_id: clubId,
    court_id: courtId,
    sport_id: sportId,
    title,
    description: data.description || null,
    start_time: startTime,
    end_time: endTime,
    capacity,
    trainer_user_id: trainerUserId || null,
    status: 'scheduled',
  });

  return training;
}

/**
 * Get training with registrations
 */
async function getTraining(trainingId) {
  const training = await Training.findByPk(trainingId, {
    include: [
      { model: require('../Models/Court'), as: 'court' },
      { model: require('../Models/Sport'), as: 'sport' },
      { model: TrainingRegistration, as: 'registrations' },
    ],
  });
  if (!training) throw ApiErrors.notFound('Training not found');
  return training;
}

/**
 * List trainings with filters
 */
async function listTrainings(filters = {}) {
  const where = {};
  if (filters.clubId) where.club_id = filters.clubId;
  if (filters.status) where.status = filters.status;

  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const { count, rows } = await Training.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['start_time', 'ASC']],
    include: [{ model: require('../Models/Court'), as: 'court' }, { model: require('../Models/Sport'), as: 'sport' }],
  });

  return {
    trainings: rows,
    meta: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) },
  };
}

/**
 * Cancel training (admin)
 */
async function cancelTraining(trainingId, user) {
  const training = await Training.findByPk(trainingId);
  if (!training) throw ApiErrors.notFound('Training not found');

  // Auth check similar to create
  const Membership = require('../Models/Membership');
  if (user.globalRole !== 'super_admin') {
    const mem = await Membership.findOne({
      where: { user_id: user.id, club_id: training.club_id, club_role: 'club_admin', status: 'approved' },
    });
    if (!mem) throw ApiErrors.forbidden('Admin access required');
  }

  training.status = 'cancelled';
  await training.save();
  return training;
}

/**
 * Training registration (mirrors match service)
 */
async function registerForTraining(trainingId, userId) {
  const training = await Training.findByPk(trainingId, {
    include: [{ model: TrainingRegistration, as: 'registrations' }],
  });
  if (!training) throw ApiErrors.notFound('Training not found');
  if (training.status !== 'scheduled') throw ApiErrors.badRequest('Training closed for registration');

  const existing = await TrainingRegistration.findOne({ where: { training_id: trainingId, user_id: userId } });
  if (existing) {
    if (existing.status === 'main') throw ApiErrors.conflict('Already registered');
    if (existing.status === 'withdrawn') {
      existing.status = 'waiting';
      await existing.save();
      return await promoteWaitlist(trainingId);
    }
  }

  const mainCount = training.registrations.filter((r) => r.status === 'main').length;
  if (mainCount < training.capacity) {
    return await TrainingRegistration.create({
      training_id: trainingId,
      user_id: userId,
      status: 'main',
      registration_time: new Date(),
    });
  } else {
    return await TrainingRegistration.create({
      training_id: trainingId,
      user_id: userId,
      status: 'waiting',
      registration_time: new Date(),
    });
  }
}

/**
 * Withdraw from training
 */
async function withdrawFromTraining(trainingId, userId) {
  const reg = await TrainingRegistration.findOne({
    where: { training_id: trainingId, user_id: userId, status: 'main' },
  });
  if (!reg) throw ApiErrors.notFound('Active registration not found');

  reg.status = 'withdrawn';
  reg.withdrawn_at = new Date();
  await reg.save();

  await promoteWaitlist(trainingId);
  return reg;
}

/**
 * Promote waitlist for training
 */
async function promoteWaitlist(trainingId) {
  const training = await Training.findByPk(trainingId, {
    include: [
      {
        model: TrainingRegistration,
        as: 'registrations',
        where: { status: 'waiting' },
        order: [['registration_time', 'ASC']],
      },
    ],
  });
  if (!training) return;

  const mainCount = training.registrations.filter((r) => r.status === 'main').length;
  if (mainCount >= training.capacity) return;

  const next = training.registrations[0];
  if (next) {
    next.status = 'main';
    await next.save();
    await promoteWaitlist(trainingId);
  }
}

module.exports = {
  createTraining,
  getTraining,
  listTrainings,
  cancelTraining,
  registerForTraining,
  withdrawFromTraining,
};
