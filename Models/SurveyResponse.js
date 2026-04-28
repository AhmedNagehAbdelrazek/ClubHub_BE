const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class SurveyResponse extends Model {}

SurveyResponse.init(
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
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'survey_questions', key: 'id' },
      field: 'question_id',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      field: 'user_id',
    },
    value_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'value_text',
    },
    value_number: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      field: 'value_number',
    },
    value_json: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'value_json',
    },
  },
  {
    sequelize,
    modelName: 'SurveyResponse',
    tableName: 'survey_responses',
    underscored: true,
  }
);

module.exports = SurveyResponse;
