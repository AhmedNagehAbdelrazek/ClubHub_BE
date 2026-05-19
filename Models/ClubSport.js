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

ClubSport.associate = (models) => {
  ClubSport.belongsTo(models.Club, { foreignKey: 'club_id', as: 'club' });
  ClubSport.belongsTo(models.Sport, { foreignKey: 'sport_id', as: 'sport' });
};

module.exports = ClubSport;
