'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('court_bookings', {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'user_id',
      },
      sport_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'sports', key: 'id' },
        field: 'sport_id',
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
      status: {
        type: Sequelize.ENUM('confirmed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'confirmed',
        field: 'status',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      requires_admin_approval: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'requires_admin_approval',
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

    // Add indexes for efficient querying
    await queryInterface.addIndex('court_bookings', ['court_id', 'start_time', 'end_time', 'status']);
    await queryInterface.addIndex('court_bookings', ['club_id']);
    await queryInterface.addIndex('court_bookings', ['user_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('court_bookings');
  },
};
