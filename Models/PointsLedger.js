const { Model, DataTypes , Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const { POINTS_SOURCE } = require('../config/constants');

class PointsLedger extends Model {}

PointsLedger.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'user_id',
    },
    club_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'clubs', key: 'id' },
      field: 'club_id',
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    source: {
      type: DataTypes.ENUM(...Object.values(POINTS_SOURCE)),
      allowNull: false,
      field: 'source',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reference_type: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reference_type',
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'reference_id',
    },
    createdat: {
      allowNull: false,
      field: 'createdat',
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  },
  {
    sequelize,
    modelName: 'PointsLedger',
    tableName: 'points_ledger',
    underscored: true,
    indexes: [{ fields: ['user_id'] }, { fields: ['club_id'] }],
  }
);

module.exports = PointsLedger;
