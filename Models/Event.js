const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Event extends Model {}

Event.init(
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
      allowNull: true,
      references: { model: 'courts', key: 'id' },
      field: 'court_id',
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
    location_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'location_text',
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
      allowNull: true,
      validate: { min: 1 },
    },
    payment_status_mode: {
      type: DataTypes.ENUM('free', 'paid', 'donation'),
      allowNull: true,
      defaultValue: 'free',
      field: 'payment_status_mode',
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
    modelName: 'Event',
    tableName: 'events',
    underscored: true,
  }
);

module.exports = Event;
