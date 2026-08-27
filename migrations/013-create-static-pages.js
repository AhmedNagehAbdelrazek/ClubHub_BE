'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('static_pages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      club_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'clubs', key: 'id' },
        field: 'club_id',
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      content_html: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'content_html',
      },
      attachment_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'attachment_url',
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
    await queryInterface.dropTable('static_pages');
  },
};
