const executor = require('./executor');


executor('node ./scripts/dev-auth-build.js');
executor.fork([
  'node ./scripts/dev-connect.js',
  'node ./scripts/dev-demo-run.js',
  'node ./scripts/dev-auth-run.js',
]);
executor('cypress open');

executor.exit();
