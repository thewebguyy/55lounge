/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/?(*.)+(spec|test).ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/lib/generated/**',
    '!src/server.ts',
  ],
  coverageThreshold: {
    // Global threshold keeps a baseline to prevent general regressions across routes/controllers
    global: {
      branches: 35,
      functions: 40,
      lines: 55,
      statements: 55,
    },
    // Quality gate: custom business logic (the service layer) is strictly held to a 70%+ quality bar
    'src/services': {
      branches: 50,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
