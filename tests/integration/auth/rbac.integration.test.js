const request = require('supertest');
const { expect } = require('expect');
const app = require('../../app').createApp;
const { createTestUser, loginAs, createSuperAdmin } = require('../../tests/helpers/auth');

describe('US2: Login & Role-Based Access Control', () => {
  let server;
  let adminToken;
  let clubId;
  let regularToken;
  let regularUserId;
  let membershipId;

  beforeAll(async () => {
    server = app();
    // Run migrations if not already
    const { execSync } = require('child_process');
    execSync('npx sequelize-cli db:migrate', { stdio: 'pipe' });

    // Create super admin and a club
    const { token, user } = await createSuperAdmin(server);
    adminToken = token;

    const clubRes = await request(server)
      .post('/api/v1/clubs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Admin Club', location: 'Admin City' });
    clubId = clubRes.body.data.id;

    // Create regular user and apply for membership
    const { user: regUser, token: regToken } = await createTestUser({ phone: '+55555555555' });
    regularUserId = regUser.id;
    regularToken = regToken;

    const membershipRes = await request(server)
      .post('/api/v1/memberships')
      .set('Authorization', `Bearer ${regularToken}`)
      .send({ clubId });
    membershipId = membershipRes.body.data.id;
  });

  afterAll(async () => {
    const { sequelize } = require('../../Models');
    await sequelize.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should issue JWT for valid credentials', async () => {
      // Use super admin login
      const res = await request(server).post('/api/v1/auth/login').send({
        phone: '+10000000000',
        password: 'SuperPass123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await request(server).post('/api/v1/auth/login').send({
        phone: '+55555555555',
        password: 'Wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  describe('RBAC Protection Matrix', () => {
    describe('Unauthenticated access', () => {
      it('should deny access to protected endpoints without token', async () => {
        const res = await request(server).get('/api/v1/memberships');
        expect(res.status).toBe(401);
      });
    });

    describe('Role-based access to membership decision', () => {
      it('should allow club admin to approve membership', async () => {
        // Promote regular user to club admin (super admin does this directly via service or by creating membership with club_role=club_admin)
        // We'll manipulate DB directly to set role for test
        const { Membership } = require('../../Models');
        // Update the regular user's membership to club_admin
        await Membership.update(
          { club_role: 'club_admin', status: 'approved', joined_at: new Date() },
          { where: { user_id: regularUserId, club_id: clubId } }
        );

        // Now regular user acts as club admin
        const res = await request(server)
          .patch(`/api/v1/memberships/${membershipId}/decision`)
          .set('Authorization', `Bearer ${regularToken}`)
          .send({ status: 'approved' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('approved');
      });

      it('should reject a regular member from accessing admin endpoint', async () => {
        // First, ensure apending membership exists for another user to test
        const newUserRes = await request(server)
          .post('/api/v1/auth/register')
          .send({
            name: 'Another Member',
            phone: '+66666666666',
            password: 'SecurePass123!',
          });
        const newToken = newUserRes.body.data.token;
        const newUserId = newUserRes.body.data.user.id;

        // Apply to new club? Actually we need a membership that this new regular user tries to decide
        // The adminToken holder (super admin) can decide; but we want to test that regular member cannot.
        // Use the same clubId but regular member is not admin, they shouldn't be able to approve anyone else's membership.
        // Create membership for the new user
        const { Membership } = require('../../Models');
        await Membership.create({
          user_id: newUserId,
          club_id: clubId,
          status: 'pending',
        });

        // Attempt to approve using regularToken (original regular user who is club admin of that club? Actually we promoted regular user to club_admin above; that user is now admin. So we need a test that a non-admin regular member (no club_role admin) cannot.
        // Let's create another regular user with member role only
        const memberRes = await request(server)
          .post('/api/v1/auth/register')
          .send({
            name: 'Simple Member',
            phone: '+77777777777',
            password: 'SecurePass123!',
          });
        const memberToken = memberRes.body.data.token;
        const memberId = memberRes.body.data.user.id;
        // Membership as regular member
        await Membership.create({
          user_id: memberId,
          club_id: clubId,
          status: 'approved',
          club_role: 'member',
        });

        // Find some pending membership from another user (maybe the one just created or another)
        const pending = await Membership.findOne({ where: { user_id: newUserId, status: 'pending' } });

        const res = await request(server)
          .patch(`/api/v1/memberships/${pending.id}/decision`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ status: 'approved' });

        expect(res.status).toBe(403);
      });

      it('should deny cross-club admin access (club admin tries to manage another club)', async () => {
        // Create a second club
        const club2Res = await request(server)
          .post('/api/v1/clubs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Other Club', location: 'Other City' });
        const club2Id = club2Res.body.data.id;

        // Create a user and membership to club2 (pending)
        const user2Res = await request(server)
          .post('/api/v1/auth/register')
          .send({
            name: 'Club2 Applicant',
            phone: '+88888888888',
            password: 'SecurePass123!',
          });
        const user2Token = user2Res.body.data.token;
        const user2Id = user2Res.body.data.user.id;

        const { Membership } = require('../../Models');
        await Membership.create({ user_id: user2Id, club_id: club2Id, status: 'pending' });
        const pending2 = await Membership.findOne({ where: { user_id: user2Id, club_id: club2Id } });

        // Attempt club1 admin (regularToken) to decide club2 membership should fail
        const res = await request(server)
          .patch(`/api/v1/memberships/${pending2.id}/decision`)
          .set('Authorization', `Bearer ${regularToken}`)
          .send({ status: 'approved' });

        expect(res.status).toBe(403);
      });
    });
  });
});
