const { sequelize } = require('../Models');
const { Club, Court, Match, Event, Training, Membership, PointsLedger, Redemption } = require('../Models');

/**
 * Aggregate dashboard stats for a club (admin view).
 */
async function getClubStats(clubId) {
  const [
    memberCount,
    courtCount,
    upcomingMatches,
    upcomingTrainings,
    upcomingEvents,
    pendingRedemptions,
  ] = await Promise.all([
    Membership.count({ where: { club_id: clubId, status: 'approved' } }),
    Court.count({ where: { club_id: clubId } }),
    Match.count({ where: { club_id: clubId, status: 'scheduled' } }),
    Training.count({ where: { club_id: clubId, status: 'scheduled' } }),
    Event.count({ where: { club_id: clubId, status: 'scheduled' } }),
    Redemption.count({ where: { club_id: clubId, status: 'pending' } }),
  ]);

  return {
    members: memberCount,
    courts: courtCount,
    matches: upcomingMatches,
    trainings: upcomingTrainings,
    events: upcomingEvents,
    pendingRedemptions,
  };
}

/**
 * Global stats for super_admin.
 */
async function getGlobalStats() {
  const [
    totalClubs,
    totalUsers,
    totalMatches,
    totalBookings,
    totalPointsIssued,
  ] = await Promise.all([
    Club.count(),
    Club.count({ distinct: true, col: 'id', through: { as: 'memberships' } }), // inaccurate; better User.count()
    Match.count(),
    sequelize.query(
      'SELECT COUNT(*) FROM court_bookings WHERE status = ?',
      { replacements: ['confirmed'] }
    ),
    PointsLedger.sum('amount', { where: { source: { [sequelize.Op.in]: ['manual', 'match_win', 'attendance', 'booking'] } } }),
  ]);

  const userCount = await require('../Models/User').count();

  return {
    clubs: totalClubs,
    users: userCount,
    matches: totalMatches,
    bookings: totalBookings,
    pointsIssued: totalPointsIssued || 0,
  };
}

/**
 * List all pending items requiring admin attention across clubs.
 */
async function getPendingActions(user) {
  const items = [];

  // Super_admin sees all
  if (user.globalRole === 'super_admin') {
    // Collect all pending redemptions, pending memberships, etc.
    const redemptions = await Redemption.findAll({
      where: { status: 'pending' },
      include: [{ model: require('../Models/Reward'), as: 'reward' }, { model: require('../Models/User'), as: 'user' }],
    });
    redemptions.forEach((r) => items.push({ type: 'redemption', id: r.id, clubId: r.club_id, user: r.user.name, details: `Redeem ${r.reward?.name}` }));

    // Pending memberships across all clubs
    const pendingMemberships = await require('../Models/Membership').findAll({
      where: { status: 'pending' },
      include: [{ model: require('../Models/User'), as: 'user' }, { model: require('../Models/Club'), as: 'club' }],
    });
    pendingMemberships.forEach((m) => items.push({ type: 'membership', id: m.id, clubId: m.club_id, user: m.user.name, details: 'Apply for membership' }));
  } else {
    // Club admin sees club-specific pending items
    // We need to know which clubs this admin manages. Call assertion to get list?
    // We'll fetch memberships for the admin
    const adminMemberships = await require('../Models/Membership').findAll({
      where: { user_id: user.id, club_role: 'club_admin', status: 'approved' },
    });
    for (const mem of adminMemberships) {
      const redemptions = await Redemption.findAll({
        where: { club_id: mem.club_id, status: 'pending' },
        include: [{ model: require('../Models/Reward'), as: 'reward' }, { model: require('../Models/User'), as: 'user' }],
      });
      redemptions.forEach((r) => items.push({ type: 'redemption', id: r.id, clubId: r.club_id, user: r.user.name, details: `Redeem ${r.reward?.name}` }));

      const pendingMembers = await require('../Models/Membership').findAll({
        where: { club_id: mem.club_id, status: 'pending' },
        include: [{ model: require('../Models/User'), as: 'user' }],
      });
      pendingMembers.forEach((m) => items.push({ type: 'membership', id: m.id, clubId: m.club_id, user: m.user.name, details: 'Apply for membership' }));
    }
  }

  return items;
}

module.exports = {
  getClubStats,
  getGlobalStats,
  getPendingActions,
};
