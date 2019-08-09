const executor = require('./executor');

executor.fork('./scripts/dev-connect.js');
executor.fork('./scripts/dev-demo.js');
executor.fork('./scripts/dev-auth.js');
executor('cypress open');

executor.exit();
