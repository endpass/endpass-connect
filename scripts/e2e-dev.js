const executor = require('./executor');

executor.fork([
  'node ./scripts/dev-connect.js',
  'node ./scripts/dev-demo.js',
  'node ./scripts/dev-auth.js',
]);
executor('cypress open');

executor.exit();
