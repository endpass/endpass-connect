const { getEnv } = require('./env');

const { NODE_ENV = 'development' } = process.env;
const ENV = getEnv(NODE_ENV);

module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpe?g|ttf|woff2?)$':
      'jest-transform-stub',
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  snapshotSerializers: ['jest-serializer-vue'],
  testMatch: ['**/tests/unit/**/*.spec.(js|jsx|ts|tsx)'],
  testURL: 'http://localhost/',
  setupFiles: ['<rootDir>/tests/unit/setup'],
  globals: {
    ENV,
  },
};
