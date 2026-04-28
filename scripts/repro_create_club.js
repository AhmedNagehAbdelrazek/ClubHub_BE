(async()=>{
  try {
    process.env.NODE_ENV='test';
    process.env.DB_USERNAME='postgres';
    process.env.DB_PASSWORD='12345';
    process.env.DB_NAME='clubhub_db';
    process.env.DB_HOST='localhost';
    process.env.DB_PORT='5432';
    process.env.PGUSER='postgres';
    process.env.PGPASSWORD='12345';
    process.env.PGDATABASE='clubhub_db';
    process.env.PGHOST='localhost';
    process.env.PGPORT='5432';
    process.env.DATABASE_URL='postgres://postgres:12345@localhost:5432/clubhub_db';
    process.env.JWT_SECRET='testsecret';
    process.env.JWT_EXPIRES_IN='7d';
    const request=require('supertest');
    const {createApp}=require('../app');
    const authHelpers=require('../tests/helpers/auth');
    const app=createApp();
    const { sequelize } = require('../Models');
    console.log('INIT DB');
    await sequelize.initDatabase({ runMigrations:false });
    console.log('DB READY');
    const sup = await authHelpers.createSuperAdmin(app);
    console.log('SUPER CREATED', sup.user.id);
    const token = sup.token;
    console.log('TOKEN LENGTH', token && token.length);
    const res = await request(app).post('/api/v1/clubs').set('Authorization', 'Bearer ' + token).send({ name:'Test Club', location:'Test City' });
    console.log('STATUS', res.status);
    console.log('BODY', JSON.stringify(res.body, null, 2));
    await sequelize.close();
  } catch (err) {
    console.error('ERR', err && err.stack ? err.stack : err);
    process.exitCode=1;
  }
})();
