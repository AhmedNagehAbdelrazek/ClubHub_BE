'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('external_links', {
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
      store_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'store_url',
      },
      maps_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'maps_url',
      },
      whatsapp_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'whatsapp_url',
      },
      instagram_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'instagram_url',
      },
      facebook_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'facebook_url',
      },
      website_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'website_url',
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
    await queryInterface.dropTable('external_links');
  },
};
