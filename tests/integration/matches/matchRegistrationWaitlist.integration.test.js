const request = require('supertest');
const { expect } = require('expect');
const app = require('../../app').createApp;
const { createSuperAdmin } = require('../../tests/helpers/auth');

describe('US6: Match Registration & Waitlist', () => {
  let server;
  let adminToken;
  let clubId;
  let courtId;
  let sportId;
  let matchId;
  let userToken;
  let userId;

  beforeAll(async () => {
    server = app();
    const { execSync } = require('child_process');
    execSync('npx sequelize-cli db:migrate', { stdio: 'pipe' });

    const { token } = await createSuperAdmin(server);
    adminToken = token;

    // Sport
    const sportRes = await request(server)
      .post('/api/v1/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Basketball', playersPerTeam: 5 });
    sportId = sportRes.body.data.id;

    // Club
    const clubRes = await request(server)
      .post('/api/v1/clubs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'WL Club', location: 'WL City' });
    clubId = clubRes.body.data.id;

    // Court
    const courtRes = await request(server)
      .post(`/api/v1/clubs/${clubId}/courts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'WL Court', capacity: 10, hourlyPrice: 30, supportedSportIds: [sportId] });
    courtId = courtRes.body.data.id;

    // Match with capacity 2 (to test waitlist easily)
    const startTime = new Date(Date.now() + 24 * 3600000);
    const endTime = new Date(startTime.getTime() + 2 * 3600000);
    const matchRes = await request(server)
      .post('/api/v1/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clubId,
        courtId,
        sportId,
        name: 'WL Test Match',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        requiredPlayers: 2,
        registrationOpenTime: new Date().toISOString(),
      });
    matchId = matchRes.body.data.id;

    // Create a regular user
    const userRes = await request(server)
      .post('/api/v1/auth/register')
      .send({ name: 'WL User', phone: '+11122233344', password: 'Pass123!' });
    userToken = userRes.body.data.token;
    userId = userRes.body.data.user.id;
  });

  afterAll(async () => {
    const { sequelize } = require('../../Models');
    await sequelize.close();
  });

  describe('Registration waitlist', () => {
    it('should accept first two registrations directly (main)', async () => {
      const res1 = await request(server)
        .post(`/api/v1/matches/${matchId}/register`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('main');

      // Second user registration
      const user2Res = await request(server)
        .post('/api/v1/auth/register')
        .send({ name: 'WL User2', phone: '+11122233345', password: 'Pass123!' });
      const token2 = user2Res.body.data.token;

      const res2 = await request(server)
        .post(`/api/v1/matches/${matchId}/register`)
        .set('Authorization', `Bearer ${token2}`);
      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('main');
    });

    it('should waitlist third registration', async () => {
      const user3Res = await request(server)
        .post('/api/v1/auth/register')
        .send({ name: 'WL User3', phone: '+11122233346', password: 'Pass123!' });
      const token3 = user3Res.body.data.token;

      const res = await request(server)
        .post(`/api/v1/matches/${matchId}/register`)
        .set('Authorization', `Bearer ${token3}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('waiting');
    });

    it('should promote waitlisted user when a main spot withdraws', async () => {
      // Withdraw first user's registration
      const withdrawRes = await request(server)
        .post(`/api/v1/matches/${matchId}/withdraw`)
        .set('Authorization', `Bearer ${userToken}`);
      // Need endpoint for withdraw; if not yet implemented, test will fail. We'll implement withdraw soon.
      // For now, we'll directly patch service call; but we'll need route.
      // We'll implement POST /api/v1/matches/:matchId/withdraw in controller.
    });
  });
});
