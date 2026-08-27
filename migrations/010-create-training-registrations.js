'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('training_registrations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      training_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'trainings', key: 'id' },
        field: 'training_id',
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

    await queryInterface.addIndex('training_registrations', ['training_id', 'user_id'], { unique: true, name: 'unique_training_user_registration' });
    await queryInterface.addIndex('training_registrations', ['training_id', 'status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('training_registrations');
  },
};
