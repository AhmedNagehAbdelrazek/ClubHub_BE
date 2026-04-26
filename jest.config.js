module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testEnv.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/migrations/**',
    '!**/seeders/**',
    '!**/tests/**',
    '!**/docs/**',
    '!server.js',
    '!app.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
