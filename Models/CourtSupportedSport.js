const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CourtSupportedSport extends Model {}

CourtSupportedSport.init(
  {
    court_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courts', key: 'id' },
      primaryKey: true,
      field: 'court_id',
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
    modelName: 'CourtSupportedSport',
    tableName: 'court_supported_sports',
    underscored: true,
    timestamps: false,
  }
);

CourtSupportedSport.associate = (models) => {
  CourtSupportedSport.belongsTo(models.Court, { foreignKey: 'court_id', as: 'court' });
  CourtSupportedSport.belongsTo(models.Sport, { foreignKey: 'sport_id', as: 'sport' });
};

module.exports = CourtSupportedSport;
