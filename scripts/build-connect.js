const childProcess = require('child_process');
const executor = require('./executor');

// build connect
executor('yarn build');
process.chdir('./dist');

try {
  childProcess.execSync('yarn unlink', { stdio: 'inherit' });
} catch (e) {}
executor('yarn link');

process.chdir('../');
