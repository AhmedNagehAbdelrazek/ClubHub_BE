'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('trainings', {
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
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      trainer_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        field: 'trainer_user_id',
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'scheduled',
        field: 'status',
      },
      created_at: {
        allowNull: false,
        field: 'created_at',
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

    await queryInterface.addIndex('trainings', ['court_id', 'start_time', 'end_time', 'status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('trainings');
  },
};
