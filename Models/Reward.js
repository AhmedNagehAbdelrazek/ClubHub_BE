const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Reward extends Model {}

Reward.init(
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
    points_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
      field: 'points_cost',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: 'Reward',
    tableName: 'rewards',
    underscored: true,
  }
);

module.exports = Reward;
