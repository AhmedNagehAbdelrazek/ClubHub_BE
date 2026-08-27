const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class PrivateQuestion extends Model {}

PrivateQuestion.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      field: 'user_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'answered', 'archived'),
      allowNull: false,
      defaultValue: 'pending',
      field: 'status',
    },
    answered_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'answered_by',
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    answered_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'answered_at',
    },
  },
  {
    sequelize,
    modelName: 'PrivateQuestion',
    tableName: 'private_questions',
    underscored: true,
  }
);

module.exports = PrivateQuestion;
