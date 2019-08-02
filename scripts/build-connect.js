const executor = require('./executor');

// build connect
try {
  executor('yarn unlink');
} catch (e) {}
executor('yarn build');
executor('yarn link');
