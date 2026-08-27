const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class ClubSport extends Model {}

ClubSport.init(
  {
    club_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clubs', key: 'id' },
      primaryKey: true,
      field: 'club_id',
    },
    sport_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sports', key: 'id' },
      primaryKey: true,
      field: 'sport_id',
    },
  },
  {
    sequelize,
    modelName: 'ClubSport',
    tableName: 'club_sports',
    underscored: true,
    timestamps: false,
  }
);

module.exports = ClubSport;
