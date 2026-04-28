const { Notification, NotificationRecipient, User, Membership } = require('../Models');
const { ApiErrors } = require('../utils/ApiError');

/**
 * Send a notification to users.
 * @param {Object} target - { type: 'user'|'club'|'global', clubId?, userId? }
 * @param {Object} payload - { title, message, data? }
 */
async function sendNotification(target, payload) {
  const { targetType, clubId, userId } = target;
  const { title, message, data } = payload;

  // Create notification
  const notification = await Notification.create({
    club_id: targetType === 'club' ? clubId : null,
    title,
    message,
    target_type: targetType,
    payload_json: data || {},
  });

  // Determine recipient user IDs
  let recipientUserIds = [];
  if (targetType === 'user' && userId) {
    recipientUserIds = [userId];
  } else if (targetType === 'club' && clubId) {
    const members = await Membership.findAll({ where: { club_id: clubId, status: 'approved' }, attributes: ['user_id'] });
    recipientUserIds = members.map((m) => m.user_id);
  } else if (targetType === 'global') {
    const users = await User.findAll({ attributes: ['id'] });
    recipientUserIds = users.map((u) => u.id);
  }

  // Bulk create recipient records
  if (recipientUserIds.length > 0) {
    await NotificationRecipient.bulkCreate(
      recipientUserIds.map((uid) => ({ notification_id: notification.id, user_id: uid }))
    );
  }

  return notification;
}

/**
 * Get notifications for a user (with pagination).
 */
async function getUserNotifications(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const { count, rows } = await NotificationRecipient.findAndCountAll({
    where: { user_id: userId },
    include: [{ model: Notification, as: 'notification' }],
    limit: parseInt(limit),
    offset,
    order: [['notification', 'sent_at', 'DESC']],
  });

  return {
    notifications: rows.map((r) => r.notification),
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

/**
 * Get unread count.
 */
async function getUnreadCount(userId) {
  return await NotificationRecipient.count({ where: { user_id: userId, read_at: null } });
}

/**
 * Mark notification as read.
 */
async function markAsRead(notificationId, userId) {
  const recipient = await NotificationRecipient.findOne({ where: { notification_id: notificationId, user_id: userId } });
  if (!recipient) throw ApiErrors.notFound('Notification not found for user');
  if (!recipient.read_at) {
    recipient.read_at = new Date();
    await recipient.save();
  }
  return recipient;
}

module.exports = {
  sendNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
};
