'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(14),
        allowNull: false,
        unique: true,
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true,
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      profile_picture_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'profile_picture_url',
      },
      global_role: {
        type: Sequelize.ENUM('user', 'super_admin'),
        allowNull: false,
        defaultValue: 'user',
        field: 'global_role',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
      // OTP and password reset fields
      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      otp_expiry_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      password_reset_token: {
        type: Sequelize.STRING,
        field: 'password_reset_token',
        allowNull: true,
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        field: 'password_reset_expires',
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

    await queryInterface.addIndex('users', ['phone'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
