'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('survey_questions', {
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
      type: {
        type: Sequelize.ENUM('text', 'number', 'multiple_choice', 'single_choice'),
        allowNull: false,
        field: 'type',
      },
      prompt: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      options_json: {
        type: Sequelize.JSONB,
        allowNull: true,
        field: 'options_json',
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'order_index',
      },
      is_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_required',
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
    await queryInterface.dropTable('survey_questions');
  },
};
