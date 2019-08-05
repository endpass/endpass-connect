const executor = require('./executor');
const child_process = require('child_process');

child_process.fork('./scripts/dev-connect.js');
child_process.fork('./scripts/dev-demo.js');
child_process.fork('./scripts/dev-auth.js');

executor('cypress open');
