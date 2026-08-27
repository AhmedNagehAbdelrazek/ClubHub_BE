const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { REGISTRATION_STATUS } = require('../config/constants');

class EventParticipant extends Model {}

EventParticipant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'events', key: 'id' },
      field: 'event_id',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'user_id',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(REGISTRATION_STATUS)),
      allowNull: false,
      defaultValue: REGISTRATION_STATUS.MAIN,
      field: 'status',
    },
  },
  {
    sequelize,
    modelName: 'EventParticipant',
    tableName: 'event_participants',
    underscored: true,
    indexes: [{ fields: ['event_id', 'user_id'], unique: true }],
  }
);

module.exports = EventParticipant;
