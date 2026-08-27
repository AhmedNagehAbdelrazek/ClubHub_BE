const request = require('supertest');
const { expect } = require('expect');
const app = require('../../app').createApp;
const { createSuperAdmin } = require('../../tests/helpers/auth');

describe('US15: Multi-Sport Club & Court Management (CRUD + Conflict)', () => {
  let server;
  let adminToken;
  let clubId;

  beforeAll(async () => {
    server = app();
    const { execSync } = require('child_process');
    execSync('npx sequelize-cli db:migrate', { stdio: 'pipe' });

    const { token, user } = await createSuperAdmin(server);
    adminToken = token;

    // Create a sport first
    const sportRes = await request(server)
      .post('/api/v1/sports') // endpoint not yet created; maybe need to create or we can skip linking
    // Since sport creation endpoint not implemented yet, we'll skip linking for now
    // But tests may require sport to link; we'll create sport directly via model later?
    // For now just create club.
    const clubRes = await request(server)
      .post('/api/v1/clubs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Club', location: 'Test City' });
    expect(clubRes.status).toBe(201);
    clubId = clubRes.body.data.id;
  });

  afterAll(async () => {
    const { sequelize } = require('../../Models');
    await sequelize.close();
  });

  describe('Club CRUD', () => {
    it('should list clubs (public)', async () => {
      const res = await request(server).get('/api/v1/clubs');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get club details', async () => {
      const res = await request(server).get(`/api/v1/clubs/${clubId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(clubId);
    });

    it('should update club', async () => {
      const res = await request(server)
        .patch(`/api/v1/clubs/${clubId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Club Name' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Club Name');
    });
  });

  // Court CRUD
  describe('Court CRUD', () => {
    let courtId;

    it('should create a court', async () => {
      const res = await request(server)
        .post(`/api/v1/clubs/${clubId}/courts`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Court 1',
          capacity: 4,
          hourlyPrice: 50,
          supportedSportIds: [],
        });
      expect(res.status).toBe(201);
      courtId = res.body.data.id;
    });

    it('should list courts for the club', async () => {
      const res = await request(server).get(`/api/v1/clubs/${clubId}/courts`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should not allow double-booking overlapping times', async () => {
      // Create first booking
      const now = new Date();
      const start1 = new Date(now.getTime() + 3600000); // +1 hour
      const end1 = new Date(start1.getTime() + 3600000); // +2 hours

      const res1 = await request(server)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courtId,
          startTime: start1.toISOString(),
          endTime: end1.toISOString(),
        });
      expect(res1.status).toBe(201);

      // Attempt overlapping booking
      const start2 = new Date(start1.getTime() + 1800000); // +30min into first booking
      const end2 = new Date(start2.getTime() + 3600000);

      const res2 = await request(server)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courtId,
          startTime: start2.toISOString(),
          endTime: end2.toISOString(),
        });
      expect(res2.status).toBe(409); // Conflict
    });
  });
});
