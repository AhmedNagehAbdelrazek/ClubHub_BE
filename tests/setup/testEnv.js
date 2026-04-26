const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env' });

// Override for test environment
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || 3001;

// Global test setup
beforeAll(async () => {
  // Ensure test database is used (the config already reads env vars)
  console.log('Test environment initialized');
});

afterAll(async () => {
  console.log('Test environment cleanup complete');
});
