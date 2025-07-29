/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/server', '<rootDir>/shared'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts',
  ],
  collectCoverageFrom: [
    'server/**/*.ts',
    'shared/**/*.ts',
    '!**/*.d.ts',
    '!**/*.config.ts',
    '!**/node_modules/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/server/test/setup.ts'],
  moduleNameMapping: {
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@/(.*)$': '<rootDir>/server/$1',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  verbose: true,
}