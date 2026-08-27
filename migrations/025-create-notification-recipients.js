'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification_recipients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      notification_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'notifications', key: 'id' },
        field: 'notification_id',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        field: 'user_id',
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'delivered_at',
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'read_at',
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

    await queryInterface.addIndex('notification_recipients', ['notification_id']);
    await queryInterface.addIndex('notification_recipients', ['user_id', 'read_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('notification_recipients');
  },
};
