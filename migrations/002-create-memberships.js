'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('memberships', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'user_id',
      },
      club_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'clubs', key: 'id' },
        field: 'club_id',
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'deactivated'),
        allowNull: false,
        defaultValue: 'pending',
        field: 'status',
      },
      club_role: {
        type: Sequelize.ENUM('member', 'club_admin'),
        allowNull: false,
        defaultValue: 'member',
        field: 'club_role',
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'joined_at',
      },
      decision_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'decision_at',
      },
      decision_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        field: 'decision_by',
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

    await queryInterface.addIndex('memberships', ['user_id', 'club_id'], { unique: true, name: 'unique_membership_per_user_club' });
    await queryInterface.addIndex('memberships', ['status']);
    await queryInterface.addIndex('memberships', ['club_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('memberships');
  },
};
