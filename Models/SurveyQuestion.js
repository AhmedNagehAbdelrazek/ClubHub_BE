const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class SurveyQuestion extends Model {}

SurveyQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    survey_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'surveys', key: 'id' },
      field: 'survey_id',
    },
    type: {
      type: DataTypes.ENUM('text', 'number', 'multiple_choice', 'single_choice'),
      allowNull: false,
      field: 'type',
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options_json: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'options_json',
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'order_index',
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_required',
    },
  },
  {
    sequelize,
    modelName: 'SurveyQuestion',
    tableName: 'survey_questions',
    underscored: true,
  }
);

module.exports = SurveyQuestion;
