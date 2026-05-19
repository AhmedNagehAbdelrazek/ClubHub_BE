const { Court, CourtSupportedSport, Sport, Club } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const { CLUB_ROLES } = require('../config/constants');

/**
 * Assert user is club admin for the given club.
 */
async function assertClubAdminForCourt(user, clubId) {
  if (user.globalRole === 'super_admin') {
    return true;
  }
  const Membership = require('../Models/Membership');
  const membership = await Membership.findOne({
    where: { user_id: user.id, club_id: clubId, club_role: CLUB_ROLES.CLUB_ADMIN, status: 'approved' },
  });
  if (!membership) {
    throw ApiErrors.forbidden('Club admin access required for this court');
  }
  return true;
}

/**
 * Create court in a club.
 */
async function createCourt(data, user) {
  const { clubId, name, capacity, hourlyPrice, supportedSportIds = [] } = data;
  await assertClubAdminForCourt(user, clubId);

  // Verify club exists
  const club = await Club.findByPk(clubId);
  if (!club) throw ApiErrors.notFound('Club not found');

  // Create court
  const court = await Court.create({
    club_id: clubId,
    name,
    capacity,
    hourly_price: hourlyPrice,
    surface_type: data.surfaceType || null,
    location_description: data.locationDescription || null,
    is_indoor: data.isIndoor || false,
    is_active: data.isActive !== undefined ? data.isActive : true,
  });

  // Link supported sports if provided
  if (supportedSportIds.length > 0) {
    const sports = await Sport.findAll({ where: { id: supportedSportIds } });
    if (sports.length !== supportedSportIds.length) {
      throw ApiErrors.badRequest('One or more invalid sport IDs');
    }
    await court.setSports(sports);
  }

  return court;
}

/**
 * Update court details and supported sports.
 */
async function updateCourt(courtId, data, user) {
  // Find existing court
  const court = await Court.findByPk(courtId, {
    include: [{ model: Sport, through: CourtSupportedSport, as: 'sports' }],
  });
  if (!court) throw ApiErrors.notFound('Court not found');

  // Admin check
  await assertClubAdminForCourt(user, court.club_id);

  // Update core fields
  if (data.name) court.name = data.name;
  if (data.capacity) court.capacity = data.capacity;
  if (data.hourlyPrice !== undefined) court.hourly_price = data.hourlyPrice;
  if (data.surfaceType !== undefined) court.surface_type = data.surfaceType;
  if (data.locationDescription !== undefined) court.location_description = data.locationDescription;
  if (data.isIndoor !== undefined) court.is_indoor = data.isIndoor;
  if (data.isActive !== undefined) court.is_active = data.isActive;

  await court.save();

  // Update supported sports if provided
  if (data.supportedSportIds !== undefined) {
    const sports = await Sport.findAll({ where: { id: data.supportedSportIds } });
    if (sports.length !== data.supportedSportIds.length) {
      throw ApiErrors.badRequest('One or more invalid sport IDs');
    }
    await court.setSports(sports);
  }

  return court;
}

/**
 * Get court by ID with sports association.
 */
async function getCourt(courtId) {
  const court = await Court.findByPk(courtId, {
    include: [
      { model: require('../Models/Club'), as: 'club' },
      { model: Sport, through: CourtSupportedSport, as: 'sports' },
    ],
  });
  if (!court) throw ApiErrors.notFound('Court not found');
  return court;
}

/**
 * List courts for a specific club.
 */
async function listCourts(clubId) {
  // Verify club exists
  const club = await Club.findByPk(clubId);
  if (!club) throw ApiErrors.notFound('Club not found');

  const courts = await Court.findAll({
    where: { club_id: clubId },
    include: [{ model: Sport, through: CourtSupportedSport, as: 'sports' }],
  });

  return courts;
}

module.exports = {
  assertClubAdminForCourt,
  createCourt,
  updateCourt,
  getCourt,
  listCourts,
};
