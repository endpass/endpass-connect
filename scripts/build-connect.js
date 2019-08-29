const executor = require('./executor');

// build connect
try {
  executor.execSync('yarn unlink');
} catch (e) {}

executor('yarn build');
process.chdir('./dist');

try {
  executor.execSync('yarn unlink');
} catch (e) {}
executor('yarn link');

process.chdir('../');
