'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('points_ledger', {
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
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      source: {
        type: Sequelize.ENUM('manual', 'match_win', 'attendance', 'booking', 'redemption'),
        allowNull: false,
        field: 'source',
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reference_type: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'reference_type',
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'reference_id',
      },
      createdat: {
        allowNull: false,
        field: 'createdat',
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('points_ledger', ['user_id']);
    await queryInterface.addIndex('points_ledger', ['club_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('points_ledger');
  },
};
