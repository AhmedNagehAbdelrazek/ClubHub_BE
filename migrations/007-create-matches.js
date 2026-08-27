'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('matches', {
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
      court_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'courts', key: 'id' },
        field: 'court_id',
      },
      sport_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'sports', key: 'id' },
        field: 'sport_id',
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'start_time',
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'end_time',
      },
      required_players: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'required_players',
      },
      registration_open_time: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'registration_open_time',
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'cancelled', 'postponed', 'completed'),
        allowNull: false,
        defaultValue: 'scheduled',
        field: 'status',
      },
      winner_team: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'winner_team',
      },
      score_summary: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'score_summary',
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

    // Add index for efficient conflict queries
    await queryInterface.addIndex('matches', ['court_id', 'start_time', 'end_time', 'status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('matches');
  },
};
