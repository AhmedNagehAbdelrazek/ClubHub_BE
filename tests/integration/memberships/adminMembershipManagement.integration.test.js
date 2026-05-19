const request = require('supertest');
const { expect } = require('expect');
const app = require('../../app').createApp;
const { createSuperAdmin } = require('../../tests/helpers/auth');

describe('US4: Admin Member Management', () => {
  let server;
  let adminToken;
  let clubId;
  let memberUserId;
  let memberToken;
  let membershipId;

  beforeAll(async () => {
    server = app();
    const { execSync } = require('child_process');
    execSync('npx sequelize-cli db:migrate', { stdio: 'pipe' });

    const { token, user } = await createSuperAdmin(server);
    adminToken = token;

    // Create club
    const clubRes = await request(server)
      .post('/api/v1/clubs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Admin Club', location: 'Admin City' });
    clubId = clubRes.body.data.id;

    // Create a regular member
    const memberRes = await request(server)
      .post('/api/v1/auth/register')
      .send({
        name: 'Club Member',
        phone: '+11133355555',
        password: 'SecurePass123!',
      });
    memberUserId = memberRes.body.data.user.id;
    memberToken = memberRes.body.data.token;

    // Member applies to club
    const membershipRes = await request(server)
      .post('/api/v1/memberships')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ clubId });
    membershipId = membershipRes.body.data.id;
  });

  afterAll(async () => {
    const { sequelize } = require('../../Models');
    await sequelize.close();
  });

  describe('Admin membership decisions', () => {
    it('should allow admin to approve membership', async () => {
      const res = await request(server)
        .patch(`/api/v1/memberships/${membershipId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('approved');
    });

    it('should allow admin to reject membership', async () => {
      // Create another membership
      const member2Res = await request(server)
        .post('/api/v1/auth/register')
        .send({ name: 'Member2', phone: '+11133366666', password: 'SecurePass123!' });
      const token2 = member2Res.body.data.token;
      await request(server)
        .post('/api/v1/memberships')
        .set('Authorization', `Bearer ${token2}`)
        .send({ clubId });

      const memberships = await request(server)
        .get(`/api/v1/memberships?clubId=${clubId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      const newMemId = memberships.body.data.find((m) => m.status === 'pending').id;

      const res = await request(server)
        .patch(`/api/v1/memberships/${newMemId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('rejected');
    });

    it('should allow admin to deactivate an active membership', async () => {
      const res = await request(server)
        .patch(`/api/v1/memberships/${membershipId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'deactivated' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('deactivated');
    });
  });

  describe('Permission enforcement', () => {
    it('should forbid non-admin from approving membership', async () => {
      const res = await request(server)
        .patch(`/api/v1/memberships/${membershipId}/decision`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(403);
    });

    it('should forbid club admin of another club from deciding', async () => {
      // Create another club and admin
      const club2 = await request(server)
        .post('/api/v1/clubs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Club 2', location: 'Loc2' });
      const club2Id = club2.body.data.id;

      const otherAdminRes = await request(server)
        .post('/api/v1/auth/register')
        .send({ name: 'Other Admin', phone: '+11177788888', password: 'SecurePass123!' });
      const otherAdminToken = otherAdminRes.body.data.token;
      // Make them admin of club2 - we need to manually set membership with club_admin role
      const { Membership } = require('../../Models');
      await Membership.create({
        user_id: otherAdminRes.body.data.user.id,
        club_id: club2Id,
        status: 'approved',
        club_role: 'club_admin',
      });

      // Try to decide membership for original club
      const res = await request(server)
        .patch(`/api/v1/memberships/${membershipId}/decision`)
        .set('Authorization', `Bearer ${otherAdminToken}`)
        .send({ status: 'approved' });
      expect(res.status).toBe(403);
    });
  });
});
