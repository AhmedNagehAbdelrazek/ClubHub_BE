const { Membership, User, Club } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');
const { ROLES, CLUB_ROLES, MEMBERSHIP_STATUS } = require('../config/constants');

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
  return Membership.findAll({
    where: { user_id: userId },
    include: [{ model: Club, as: 'club' }],
  });
}

/**
 * Get memberships for a club (admin view). Admin must be validated before calling.
 */
async function getClubMemberships(clubId, filters = {}) {
  const where = { club_id: clubId };
  if (filters.status) {
    where.status = filters.status;
  }
  return Membership.findAll({
    where,
    include: [{ model: User, as: 'user' }],
  });
}

/**
 * Verify that an admin can manage a specific club.
 */
async function assertClubAdminAccess(userId, clubId) {
  if (userId.globalRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  const membership = await Membership.findOne({
    where: { user_id: userId, club_id: clubId, club_role: CLUB_ROLES.CLUB_ADMIN, status: MEMBERSHIP_STATUS.APPROVED },
  });
  if (!membership) throw ApiErrors.forbidden('Club admin access required');
  return true;
}

module.exports = {
  applyForMembership,
  decideMembership,
  getUserMemberships,
  getClubMemberships,
  assertClubAdminAccess,
};
