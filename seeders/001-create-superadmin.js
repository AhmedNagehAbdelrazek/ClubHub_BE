'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const ADMIN_PHONE = process.env.ADMIN_PHONE;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PHONE || !ADMIN_PASSWORD) {
      console.warn('WARNING: ADMIN_PHONE or ADMIN_PASSWORD not set in .env, skipping superadmin seed');
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const now = new Date();
    const id = Sequelize.literal('gen_random_uuid()');
    console.log('Creating superadmin user with ID:', id);
    await queryInterface.bulkInsert('users', [{
      id: id,
      name: 'Super Admin',
      phone: ADMIN_PHONE,
      password_hash: passwordHash,
      global_role: 'super_admin',
      is_active: true,
      otp: null,
      otp_expiry_time: null,
      password_reset_token: null,
      password_reset_expires: null,
      createdat: now,
      updatedat: now,
    }], {});

    console.log('Superadmin user created successfully with phone:', ADMIN_PHONE);
  },

  async down(queryInterface) {
    const ADMIN_PHONE = process.env.ADMIN_PHONE;
    if (!ADMIN_PHONE) return;

    await queryInterface.bulkDelete('users', {
      phone: ADMIN_PHONE,
      global_role: 'super_admin',
    }, {});
  },
};
