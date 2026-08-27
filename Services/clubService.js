const { Club, Sport, ClubSport, Court } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const { ROLES, CLUB_ROLES } = require('../config/constants');

/**
 * Assert that the user is admin (super_admin or club_admin) for a specific club.
 */
async function assertClubAdmin(user, clubId) {
  if (user.globalRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  const membership = await require('../Models/Membership').findOne({
    where: { user_id: user.id, club_id: clubId, club_role: CLUB_ROLES.CLUB_ADMIN, status: 'approved' },
  });
  if (!membership) {
    throw ApiErrors.forbidden('Club admin access required for this club');
  }
  return true;
}

/**
 * Create a new club (super_admin only).
 */
async function createClub(data, user) {
  if (user.globalRole !== ROLES.SUPER_ADMIN) {
    throw ApiErrors.forbidden('Only super admin can create clubs');
  }

  const club = await Club.create({
    name: data.name,
    location: data.location,
    logo_url: data.logoUrl || null,
    settings: data.settings || {},
  });

  return club;
}

/**
 * Update an existing club.
 */
async function updateClub(clubId, data, user) {
  await assertClubAdmin(user, clubId);
  const club = await Club.findByPk(clubId);
  if (!club) {
    throw ApiErrors.notFound('Club not found');
  }

  if (data.name) club.name = data.name;
  if (data.location) club.location = data.location;
  if (data.logoUrl !== undefined) club.logo_url = data.logoUrl;
  if (data.settings) club.settings = { ...club.settings, ...data.settings };

  await club.save();
  return club;
}

/**
 * Get a club by ID.
 */
async function getClub(clubId) {
  const club = await Club.findByPk(clubId, {
    include: [{ model: Sport, through: ClubSport, as: 'sports' }],
  });
  if (!club) {
    throw ApiErrors.notFound('Club not found');
  }
  return club;
}

/**
 * List all clubs (public).
 */
async function listClubs(query = {}) {
  const { page = 1, limit = 20 } = query;
  const offset = (page - 1) * limit;

  const { count, rows: clubs } = await Club.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdat', 'DESC']],
    include: [{ model: Sport, through: ClubSport, as: 'sports' }],
  });

  return {
    clubs,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
   };
}

/**
 * Link a sport to a club (admin only)
 */
async function linkSport(clubId, sportId, user) {
  await assertClubAdmin(user, clubId);
  const sport = await Sport.findByPk(sportId);
  if (!sport) {
    throw ApiErrors.notFound('Sport not found');
  }
  const club = await Club.findByPk(clubId);
  if (!club) {
    throw ApiErrors.notFound('Club not found');
  }
  await club.addSport(sport);
  return { message: 'Sport linked to club' };
}

module.exports = {
  assertClubAdmin,
  createClub,
  updateClub,
  getClub,
  listClubs,
  linkSport,
};
