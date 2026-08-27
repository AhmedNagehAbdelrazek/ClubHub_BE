const notificationService = require('../Services/notificationService');
const { NotificationRecipient } = require('../Models');

module.exports = (io, socket) => {
  socket.on('subscribeToNotifications', (userId) => {
    socket.join(`notifications_${userId}`);
  });

  socket.on('sendNotification', async (notificationData, ack) => {
    try {
      const notification = await notificationService.sendNotification(
        {
          targetType: notificationData.targetType,
          clubId: notificationData.clubId,
          userId: notificationData.userId,
        },
        {
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data,
        }
      );

      const recipients = await NotificationRecipient.findAll({ where: { notification_id: notification.id } });
      recipients.forEach((recipient) => {
        io.to(`notifications_${recipient.user_id}`).emit('notification', notification);
      });

      if (typeof ack === 'function') {
        ack({ ok: true, notification });
      }
    } catch (error) {
      if (typeof ack === 'function') {
        ack({ ok: false, error: error.message });
      }
    }
  });
};
  