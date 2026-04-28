const { Model, DataTypes , Sequelize } = require('sequelize');
const sequelize = require('../config/database');

class Redemption extends Model {}

Redemption.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reward_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'rewards', key: 'id' },
      field: 'reward_id',
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
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'status',
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'requested_at',
    },
    decided_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'decided_at',
    },
    decided_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'decided_by',
    },
  },
  {
    sequelize,
    modelName: 'Redemption',
    tableName: 'redemptions',
    underscored: true,
  }
);

module.exports = Redemption;
