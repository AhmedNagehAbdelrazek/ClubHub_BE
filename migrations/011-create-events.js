'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('events', {
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
        allowNull: true,
        references: { model: 'courts', key: 'id' },
        field: 'court_id',
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'location_text',
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
        allowNull: true,
      },
      payment_status_mode: {
        type: Sequelize.ENUM('free', 'paid', 'donation'),
        allowNull: true,
        defaultValue: 'free',
        field: 'payment_status_mode',
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('events');
  },
};
