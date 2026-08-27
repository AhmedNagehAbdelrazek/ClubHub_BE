const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CourtBooking extends Model {}

CourtBooking.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'user_id',
    },
    sport_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'sports', key: 'id' },
      field: 'sport_id',
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
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'confirmed',
      field: 'status',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requires_admin_approval: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'requires_admin_approval',
    },
  },
  {
    sequelize,
    modelName: 'CourtBooking',
    tableName: 'court_bookings',
    underscored: true,
    indexes: [
      { fields: ['court_id', 'start_time', 'end_time', 'status'] },
      { fields: ['club_id'] },
      { fields: ['user_id'] },
    ],
  }
);

module.exports = CourtBooking;