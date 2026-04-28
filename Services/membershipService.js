const { Membership, User, Club } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const { ROLES, CLUB_ROLES, MEMBERSHIP_STATUS } = require('../config/constants');

const normalizeMembership = (membership) => {
  const data = membership?.toJSON ? membership.toJSON() : membership;
  if (!data) {
    return data;
  }
  return {
    ...data,
    userId: data.userId || data.user_id,
    clubId: data.clubId || data.club_id,
  };
};

/**
 * Apply for membership to a club.
 */
async function applyForMembership(userId, clubId) {
  // Check if club exists
  const club = await Club.findByPk(clubId);
  if (!club) throw ApiErrors.notFound('Club not found');

  // Check existing application
  const existing = await Membership.findOne({ where: { user_id: userId, club_id: clubId } });
  if (existing) {
    throw ApiErrors.conflict('Membership already applied or exists');
  }

  const membership = await Membership.create({
    user_id: userId,
    club_id: clubId,
    status: MEMBERSHIP_STATUS.PENDING,
    club_role: CLUB_ROLES.MEMBER,
  });

  return membership;
}

/**
 * Decide on a membership application (approve/reject/deactivate)
 */
async function decideMembership(membershipId, decision, adminId) {
  const membership = await Membership.findByPk(membershipId);
  if (!membership) throw ApiErrors.notFound('Membership not found');

  switch (decision) {
    case MEMBERSHIP_STATUS.APPROVED:
      await membership.approve(adminId);
      break;
    case MEMBERSHIP_STATUS.REJECTED:
      await membership.reject(adminId);
      break;
    case MEMBERSHIP_STATUS.DEACTIVATED:
      await membership.deactivate();
      break;
    default:
      throw ApiErrors.badRequest('Invalid decision');
  }

  return membership;
}

/**
 * Get memberships for a specific user.
 */
async function getUserMemberships(userId) {
  const memberships = await Membership.findAll({
    where: { user_id: userId },
    include: [{ model: Club, as: 'club' }],
  });
  return memberships.map(normalizeMembership);
}

/**
 * Get memberships for a club (admin view). Admin must be validated before calling.
 */
async function getClubMemberships(clubId, filters = {}) {
  const where = { club_id: clubId };
  if (filters.status) {
    where.status = filters.status;
  }
  const memberships = await Membership.findAll({
    where,
    include: [{ model: User, as: 'user' }],
  });
  return memberships.map(normalizeMembership);
}

/**
 * Get all memberships (super admin view).
 */
async function getAllMemberships(filters = {}) {
  const where = {};
  if (filters.status) {
    where.status = filters.status;
  }
  const memberships = await Membership.findAll({
    where,
    include: [
      { model: User, as: 'user' },
      { model: Club, as: 'club' },
    ],
  });
  return memberships.map(normalizeMembership);
}

/**
 * Verify that an admin can manage a specific club.
 */
async function assertClubAdminAccess(user, clubId) {
  if (user.globalRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  const membership = await Membership.findOne({
    where: {
      user_id: user.id,
      club_id: clubId,
      club_role: CLUB_ROLES.CLUB_ADMIN,
      status: MEMBERSHIP_STATUS.APPROVED,
    },
  });
  if (!membership) throw ApiErrors.forbidden('Club admin access required');
  return true;
}

module.exports = {
  applyForMembership,
  decideMembership,
  getUserMemberships,
  getClubMemberships,
  getAllMemberships,
  assertClubAdminAccess,
};
