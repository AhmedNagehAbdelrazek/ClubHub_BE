const request = require('supertest');
const { User } = require('../../Models');
const bcrypt = require('bcrypt');

/**
 * Create a test user and return credentials.
 */
async function createTestUser({ name = 'Test User', phone = '+1234567890', password = 'Password123!' } = {}) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    password_hash: hashedPassword,
    global_role: 'user',
    is_active: true,
  });

  return { user, password };
}

/**
 * Obtain a JWT token for a user by logging in.
 */
async function loginAs(app, { phone, password }) {
  const response = await request(app).post('/api/v1/auth/login').send({ phone, password });
  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.body?.message}`);
  }
  return response.body.data.token;
}

/**
 * Create an authenticated superadmin user and return token.
 */
async function createSuperAdmin(app) {
  const { user, password } = await createTestUser({
    name: 'Super Admin',
    phone: '+10000000000',
    password: 'SuperPass123!',
  });
  user.global_role = 'super_admin';
  await user.save();

  const token = await loginAs(app, { phone: user.phone, password });
  return { user, token };
}

/**
 * Authenticate as a club admin for a specific club.
 * This may require creating a club and membership in the future.
 */

module.exports = {
  createTestUser,
  loginAs,
  createSuperAdmin,
};
