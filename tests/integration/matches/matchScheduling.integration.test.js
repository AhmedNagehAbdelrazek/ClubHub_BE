const request = require('supertest');
const { expect } = require('expect');
const app = require('../../app').createApp;
const { createSuperAdmin } = require('../../tests/helpers/auth');

describe('US5: Match Scheduling & Management', () => {
  let server;
  let adminToken;
  let clubId;
  let courtId;
  let sportId;

  beforeAll(async () => {
    server = app();
    const { execSync } = require('child_process');
    execSync('npx sequelize-cli db:migrate', { stdio: 'pipe' });

    const { token } = await createSuperAdmin(server);
    adminToken = token;

    // Create sport first
    const sportRes = await request(server)
      .post('/api/v1/sports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Volleyball', playersPerTeam: 6 });
    sportId = sportRes.body.data.id;

    // Create club
    const clubRes = await request(server)
      .post('/api/v1/clubs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Match Club', location: 'Match City' });
    clubId = clubRes.body.data.id;

    // Create court
    const courtRes = await request(server)
      .post(`/api/v1/clubs/${clubId}/courts`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Match Court',
        capacity: 12,
        hourlyPrice: 40,
        supportedSportIds: [sportId],
      });
    courtId = courtRes.body.data.id;
  });

  afterAll(async () => {
    const { sequelize } = require('../../Models');
    await sequelize.close();
  });

  describe('Match lifecycle', () => {
    it('should schedule a new match', async () => {
      const startTime = new Date(Date.now() + 24 * 3600000);
      const endTime = new Date(startTime.getTime() + 2 * 3600000);

      const res = await request(server)
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clubId,
          courtId,
          sportId,
          name: 'Evening Match',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          requiredPlayers: 4,
          registrationOpenTime: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.id).toBeDefined();
    });

    it('should prevent double-booking conflicting times', async () => {
      const startTime = new Date(Date.now() + 48 * 3600000);
      const endTime = new Date(startTime.getTime() + 2 * 3600000);

      // First match
      await request(server)
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clubId,
          courtId,
          sportId,
          name: 'Match A',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          requiredPlayers: 4,
          registrationOpenTime: new Date().toISOString(),
        });

      // Overlapping match
      const overlapStart = new Date(startTime.getTime() + 3600000); // +1h into first
      const overlapEnd = new Date(overlapStart.getTime() + 2 * 3600000);

      const res = await request(server)
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          clubId,
          courtId,
          sportId,
          name: 'Match B Overlap',
          startTime: overlapStart.toISOString(),
          endTime: overlapEnd.toISOString(),
          requiredPlayers: 4,
          registrationOpenTime: new Date().toISOString(),
        });

      expect(res.status).toBe(409);
    });
  });
});
