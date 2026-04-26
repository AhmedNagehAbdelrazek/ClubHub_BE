const request = require('supertest');
const { expect } = require('expect');
const app = require('../../app').createApp;
const { createTestUser, loginAs, createSuperAdmin } = require('../../tests/helpers/auth');
const { sequelize } = require('../../Models');

describe('US1: Registration & Membership Approval', () => {
  let server;
  let adminToken;
  let clubId;

  beforeAll(async () => {
    server = app();
    // Ensure DB connection and migrations run for test database
    await sequelize.authenticate();
    // Run migrations synchronously for test
    const { execSync } = require('child_process');
    execSync('npx sequelize-cli db:migrate', { stdio: 'pipe' });

    // Create super admin and get token
    const { token, user: adminUser } = await createSuperAdmin(server);
    adminToken = token;

    // Create a club for membership application
    const clubRes = await request(server)
      .post('/api/v1/clubs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Club', location: 'Test City' });
    expect(clubRes.status).toBe(201);
    clubId = clubRes.body.data.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(server)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          phone: '+11111111111',
          password: 'SecurePass123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.phone).toBe('+11111111111');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject duplicate phone number', async () => {
      const res = await request(server)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another User',
          phone: '+11111111111',
          password: 'SecurePass123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/memberships', () => {
    let userToken;
    let userId;

    beforeAll(async () => {
      // Register a regular user
      const registerRes = await request(server)
        .post('/api/v1/auth/register')
        .send({
          name: 'Member User',
          phone: '+22222222222',
          password: 'SecurePass123!',
        });
      userToken = registerRes.body.data.token;
      userId = registerRes.body.data.user.id;
    });

    it('should allow authenticated user to apply to a club', async () => {
      const res = await request(server)
        .post('/api/v1/memberships')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ clubId });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('pending');
    });

    it('should prevent duplicate membership application', async () => {
      const res = await request(server)
        .post('/api/v1/memberships')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ clubId });

      expect(res.status).toBe(409);
    });
  });

  describe('PATCH /api/v1/memberships/:membershipId/decision', () => {
    let membershipId;

    beforeAll(async () => {
      // Get the pending membership ID
      const listRes = await request(server)
        .get('/api/v1/memberships')
        .set('Authorization', `Bearer ${adminToken}`);
      const membership = listRes.body.data.find((m) => m.userId && m.status === 'pending');
      membershipId = membership.id;
    });

    it('should allow admin to approve membership', async () => {
      const res = await request(server)
        .patch(`/api/v1/memberships/${membershipId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('approved');
    });

    it('should not allow non-admin to approve membership', async () => {
      // Re-register a regular user for this test
      const reg = await request(server)
        .post('/api/v1/auth/register')
        .send({
          name: 'Regular User',
          phone: '+33333333333',
          password: 'SecurePass123!',
        });
      const regularToken = reg.body.data.token;

      const res = await request(server)
        .patch(`/api/v1/memberships/${membershipId}/decision`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(403);
    });
  });
});
