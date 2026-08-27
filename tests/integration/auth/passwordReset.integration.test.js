const request = require('supertest');
const { expect } = require('expect');
const app = require('../../app').createApp;
const { createTestUser } = require('../../tests/helpers/auth');

describe('US3: Password Reset (OTP-based)', () => {
  let server;
  let userToken;
  let userId;

  beforeAll(async () => {
    server = app();
    // Ensure DB migrated
    const { execSync } = require('child_process');
    execSync('npx sequelize-cli db:migrate', { stdio: 'pipe' });

    const { user, token } = await createTestUser({ phone: '+99999999999' });
    userToken = token;
    userId = user.id;
  });

  afterAll(async () => {
    const { sequelize } = require('../../Models');
    await sequelize.close();
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should generate OTP and send response', async () => {
      const res = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({ phone: '+99999999999' });

      // In production, OTP would be SMS'd; here we get it in response for testing
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.otp).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    let otp;

    beforeAll(async () => {
      // First, request OTP
      const forgotRes = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({ phone: '+99999999999' });
      otp = forgotRes.body.data.otp;
    });

    it('should verify valid OTP and return reset token', async () => {
      const res = await request(server)
        .post('/api/v1/auth/verify-otp')
        .send({ phone: '+99999999999', otp });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.resetToken).toBeDefined();
    });

    it('should reject invalid OTP', async () => {
      const res = await request(server)
        .post('/api/v1/auth/verify-otp')
        .send({ phone: '+99999999999', otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    let resetToken;

    beforeAll(async () => {
      const forgotRes = await request(server)
        .post('/api/v1/auth/forgot-password')
        .send({ phone: '+99999999999' });
      const otp = forgotRes.body.data.otp;
      const verifyRes = await request(server)
        .post('/api/v1/auth/verify-otp')
        .send({ phone: '+99999999999', otp });
      resetToken = verifyRes.body.data.resetToken;
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewSecurePass123!';
      const res = await request(server)
        .post('/api/v1/auth/reset-password')
        .send({ token: resetToken, password: newPassword });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      // Verify old token invalid by trying to login with new password
      // Actually login with new password should work; we can test login
      const loginRes = await request(server)
        .post('/api/v1/auth/login')
        .send({ phone: '+99999999999', password: newPassword });
      expect(loginRes.status).toBe(200);
    });

    it('should reject invalid reset token', async () => {
      const res = await request(server)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'invalid-token', password: 'AnotherPass123!' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });
});
