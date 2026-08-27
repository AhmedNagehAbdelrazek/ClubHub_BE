'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('player_ratings', {
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
      match_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'matches', key: 'id' },
        field: 'match_id',
      },
      player_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'player_id',
      },
      rated_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'rated_by',
      },
      stars: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('player_ratings', ['player_id']);
    await queryInterface.addIndex('player_ratings', ['match_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('player_ratings');
  },
};
