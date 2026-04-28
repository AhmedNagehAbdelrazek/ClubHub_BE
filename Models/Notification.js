const { Model, DataTypes, Sequelize  } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    club_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'clubs', key: 'id' },
      field: 'club_id',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    target_type: {
      type: DataTypes.ENUM('user', 'club', 'global'),
      allowNull: false,
      defaultValue: 'global',
      field: 'target_type',
    },
    payload_json: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'payload_json',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'sent_at',
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    underscored: true,
  }
);

module.exports = Notification;
