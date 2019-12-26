const pkg = require('../package.json');
const prod = require('./prod');
const dev = require('./dev');
const test = require('./test');

let local;
try {
  // eslint-disable-next-line
  local = require('./local');
} catch (e) {}

const getEnvObject = env => {
  switch ((env || '').toLowerCase()) {
    case 'production':
      return prod;
    case 'development':
      return dev;
    case 'test':
      return test;
    default:
      return local || dev;
  }
};

const getEnv = env => {
  const res = getEnvObject(env);

  return {
    authVersion: pkg.authVersion,
    version: pkg.version,
    ...res,
  };
};

module.exports = {
  getEnv,
};
