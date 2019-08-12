const childProcess = require('child_process');
const executor = require('./executor');

// build connect
try {
  childProcess.execSync('yarn unlink', { stdio: 'inherit' });
} catch (e) {}
executor([
  //
  'yarn build',
  'yarn link',
]);
