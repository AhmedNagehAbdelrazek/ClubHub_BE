const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Survey extends Model {}

Survey.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_anonymous',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'closed'),
      allowNull: false,
      defaultValue: 'draft',
      field: 'status',
    },
    starts_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'starts_at',
    },
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ends_at',
    },
  },
  {
    sequelize,
    modelName: 'Survey',
    tableName: 'surveys',
    underscored: true,
  }
);

module.exports = Survey;
