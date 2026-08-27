const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const { REGISTRATION_STATUS } = require('../config/constants');

class TrainingRegistration extends Model {}

TrainingRegistration.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    training_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'trainings', key: 'id' },
      field: 'training_id',
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
    modelName: 'TrainingRegistration',
    tableName: 'training_registrations',
    underscored: true,
    indexes: [{ fields: ['training_id', 'user_id'], unique: true }],
  }
);

module.exports = TrainingRegistration;
