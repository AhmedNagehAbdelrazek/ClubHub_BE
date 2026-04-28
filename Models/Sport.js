const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Sport extends Model {}

Sport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true, len: [2, 50] },
    },
    icon_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'icon_url',
    },
    players_per_team: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
  },
  {
    sequelize,
    modelName: 'Sport',
    tableName: 'sports',
    underscored: true,
  }
);

module.exports = Sport;
