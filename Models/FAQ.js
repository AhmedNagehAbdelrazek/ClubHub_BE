const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class FAQ extends Model {}

FAQ.init(
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
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'order_index',
    },
  },
  {
    sequelize,
    modelName: 'FAQ',
    tableName: 'faqs',
    underscored: true,
  }
);

module.exports = FAQ;
