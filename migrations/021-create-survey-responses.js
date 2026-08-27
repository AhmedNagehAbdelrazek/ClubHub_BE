'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('survey_responses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      survey_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'surveys', key: 'id' },
        field: 'survey_id',
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'survey_questions', key: 'id' },
        field: 'question_id',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        field: 'user_id',
      },
      value_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'value_text',
      },
      value_number: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        field: 'value_number',
      },
      value_json: {
        type: Sequelize.JSONB,
        allowNull: true,
        field: 'value_json',
      },
      createdat: {
        allowNull: false,
        field: 'createdat',
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        field: 'updated_at',
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('survey_responses');
  },
};
