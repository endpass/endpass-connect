const { getEnv } = require('./env');

const { NODE_ENV } = process.env;
const ENV = getEnv(NODE_ENV);

module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!@endpass/class)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['./**/*.spec.(js|jsx|ts|tsx)'],
  setupFiles: ['<rootDir>/tests/unit/setup'],
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setupTests'],
  globals: {
    ENV,
  },
};
