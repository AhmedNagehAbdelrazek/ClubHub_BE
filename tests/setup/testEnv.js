const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env' });

// Override for test environment
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || 3001;

process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = '12345';
process.env.DB_NAME = 'clubhub_db';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.PGUSER = 'postgres';
process.env.PGPASSWORD = '12345';
process.env.PGDATABASE = 'clubhub_db';
process.env.PGHOST = 'localhost';
process.env.PGPORT = '5432';
process.env.DATABASE_URL = 'postgres://postgres:12345@localhost:5432/clubhub_db';

const { sequelize } = require('../../Models');
const childProcess = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const originalExecSync = childProcess.execSync;
childProcess.execSync = (command, options = {}) => {
  const mergedOptions = {
    ...options,
    cwd: options.cwd || repoRoot,
    env: {
      ...process.env,
      ...options.env,
      DB_USERNAME: process.env.DB_USERNAME,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV
    }
  };

  return originalExecSync(command, mergedOptions);
};

async function truncateAllTables() {
  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  if (!tables || tables.length === 0) {
    return;
  }

  const tableNames = tables
    .map((table) => {
      const name = typeof table === 'object' ? table.tableName : table;
      const schema = typeof table === 'object' ? table.schema : null;
      return {
        name,
        quoted: schema ? `"${schema}"."${name}"` : `"${name}"`
      };
    })
    .filter(({ name }) => name && name !== 'SequelizeMeta')
    .map(({ quoted }) => quoted);

  if (tableNames.length === 0) {
    return;
  }

  await sequelize.query(`TRUNCATE ${tableNames.join(', ')} RESTART IDENTITY CASCADE`);
}

const originalClose = sequelize.close.bind(sequelize);
sequelize.close = async () => {
  try {
    await truncateAllTables();
  } catch (error) {
    console.warn('Failed to truncate test tables:', error.message);
  }
  return originalClose();
};

// Ensure test DB exists before any integration suite runs.
beforeAll(async () => {
  await sequelize.initDatabase({ runMigrations: false });
  await truncateAllTables();
});

// Global test setup
beforeAll(async () => {
  // Ensure test database is used (the config already reads env vars)
  console.log('Test environment initialized');
});

afterAll(async () => {
  console.log('Test environment cleanup complete');
});
