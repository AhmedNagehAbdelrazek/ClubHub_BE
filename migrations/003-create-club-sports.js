'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('club_sports', {
      club_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'clubs', key: 'id' },
        primaryKey: true,
        field: 'club_id',
      },
      sport_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'sports', key: 'id' },
        primaryKey: true,
        field: 'sport_id',
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
    await queryInterface.dropTable('club_sports');
  },
};
