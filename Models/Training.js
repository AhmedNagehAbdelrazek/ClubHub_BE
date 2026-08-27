const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Training extends Model {}

Training.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    club_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clubs', key: 'id' },
      field: 'club_id',
    },
    court_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courts', key: 'id' },
      field: 'court_id',
    },
    sport_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sports', key: 'id' },
      field: 'sport_id',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [2, 200] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_time',
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    trainer_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'trainer_user_id',
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'scheduled',
      field: 'status',
    },
  },
  {
    sequelize,
    modelName: 'Training',
    tableName: 'trainings',
    underscored: true,
    indexes: [{ fields: ['court_id', 'start_time', 'end_time', 'status'] }],
  }
);

module.exports = Training;
