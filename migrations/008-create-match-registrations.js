'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('match_registrations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      match_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'matches', key: 'id' },
        field: 'match_id',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'user_id',
      },
      status: {
        type: Sequelize.ENUM('main', 'waiting', 'withdrawn', 'confirmed'),
        allowNull: false,
        defaultValue: 'main',
        field: 'status',
      },
      registration_time: {
        allowNull: false,
        field: 'registration_time',
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      withdrawn_at: {
        allowNull: true,
        field: 'withdrawn_at',
        type: Sequelize.DATE,
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

    // Unique index ensures one registration per user per match
    await queryInterface.addIndex('match_registrations', ['match_id', 'user_id'], { unique: true, name: 'unique_match_user_registration' });
    await queryInterface.addIndex('match_registrations', ['match_id', 'status']);
    await queryInterface.addIndex('match_registrations', ['user_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('match_registrations');
  },
};
