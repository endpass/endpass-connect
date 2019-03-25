const pkg = require('../package.json');

const infura = {
  key: 'zU4GTAQ0LjJNKddbyztc',
};

const isProduction = true;

module.exports = {
  infura,
  isProduction,
  authVersion: `/v${pkg.authVersion}`,
};
