const pkg = require('../package.json');

const infura = {
  key: 'zU4GTAQ0LjJNKddbyztc',
};

const isProduction = false;

module.exports = {
  infura,
  isProduction,
  authVersion: `/v${pkg.authVersion}`,
};
