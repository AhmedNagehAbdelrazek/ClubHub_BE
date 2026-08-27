const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const { REGISTRATION_STATUS } = require('../config/constants');

class MatchRegistration extends Model {}

MatchRegistration.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    match_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'matches', key: 'id' },
      field: 'match_id',
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
    registration_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'registration_time',
    },
    withdrawn_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'withdrawn_at',
    },
  },
  {
    sequelize,
    modelName: 'MatchRegistration',
    tableName: 'match_registrations',
    underscored: true,
    indexes: [{ fields: ['match_id', 'user_id'], unique: true }],
  }
);

module.exports = MatchRegistration;
