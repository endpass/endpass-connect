const executor = require('./executor');

// build connect
executor('node ./scripts/build-connect.js');
executor('node ./scripts/build-auth.js');
executor('node ./scripts/build-demo.js');
