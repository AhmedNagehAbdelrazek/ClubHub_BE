const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Court extends Model {}

Court.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true, len: [2, 100] },
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    hourly_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'hourly_price',
      validate: { min: 0 },
    },
    surface_type: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'surface_type',
    },
    location_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'location_description',
    },
    is_indoor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_indoor',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    modelName: 'Court',
    tableName: 'courts',
    underscored: true,
    indexes: [
      { fields: ['club_id', 'name'], unique: true },
    ],
  }
);

Court.associate = (models) => {
  Court.belongsTo(models.Club, { foreignKey: 'club_id', as: 'club' });
  Court.belongsToMany(models.Sport, {
    through: models.CourtSupportedSport,
    foreignKey: 'court_id',
    otherKey: 'sport_id',
    as: 'sports',
  });
  Court.hasMany(models.CourtBooking, { foreignKey: 'court_id', as: 'bookings' });
  Court.hasMany(models.Match, { foreignKey: 'court_id', as: 'matches' });
};

module.exports = Court;
