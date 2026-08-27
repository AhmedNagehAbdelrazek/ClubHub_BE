const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class NotificationRecipient extends Model {}

NotificationRecipient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    notification_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'notifications', key: 'id' },
      field: 'notification_id',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'user_id',
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivered_at',
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },
  },
  {
    sequelize,
    modelName: 'NotificationRecipient',
    tableName: 'notification_recipients',
    underscored: true,
  }
);

module.exports = NotificationRecipient;
