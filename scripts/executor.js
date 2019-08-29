const childProcess = require('child_process');
// eslint-disable-next-line import/no-extraneous-dependencies
const concurrently = require('concurrently');

function executor(cmd) {
  if (!Array.isArray(cmd)) {
    // eslint-disable-next-line
    cmd = [cmd];
  }
  for (let i = 0, l = cmd.length; i < l; i++) {
    const cmdItem = cmd[i];
    console.log('-- [cmd start]', cmdItem);
    try {
      executor.execSync(cmdItem);
    } catch (e) {
      console.error(e);
      process.exit(1);
      throw new Error('execution fail');
    }
    console.log('-- [cmd end]', cmdItem, '\n');
  }
}

executor.execSync = cmd => {
  return childProcess.execSync(cmd, { stdio: 'inherit' });
};

executor.fork = modulePath => {
  concurrently(modulePath, {
    prefix: 'name',
    killOthers: ['failure', 'success'],
    restartTries: 1,
    raw: true,
  }).then(
    () => {
      console.log('done');
    },
    () => {
      console.log('fail');
    },
  );
};

executor.exit = code => {
  process.exit(code || 0);
};

module.exports = executor;
