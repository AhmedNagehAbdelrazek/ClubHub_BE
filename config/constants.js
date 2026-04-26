module.exports = {
  // Global user roles
  ROLES: {
    USER: 'user',
    SUPER_ADMIN: 'super_admin',
  },

  // Membership statuses
  MEMBERSHIP_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DEACTIVATED: 'deactivated',
  },

  // Club roles (within a club)
  CLUB_ROLES: {
    MEMBER: 'member',
    CLUB_ADMIN: 'club_admin',
  },

  // Court booking statuses
  BOOKING_STATUS: {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  // Match statuses
  MATCH_STATUS: {
    SCHEDULED: 'scheduled',
    CANCELLED: 'cancelled',
    POSTPONED: 'postponed',
    COMPLETED: 'completed',
  },

  // Registration statuses for matches/trainings/events
  REGISTRATION_STATUS: {
    MAIN: 'main',
    WAITING: 'waiting',
    WITHDRAWN: 'withdrawn',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
  },

  // Points ledger sources
  POINTS_SOURCE: {
    MANUAL: 'manual',
    MATCH_WIN: 'match_win',
    ATTENDANCE: 'attendance',
    BOOKING: 'booking',
    REDEMPTION: 'redemption',
  },

  // Notification target types
  NOTIFICATION_TARGET: {
    USER: 'user',
    CLUB: 'club',
    GLOBAL: 'global',
  },
};
