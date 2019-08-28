const childProcess = require('child_process');
const concurrently = require('concurrently');

const children = [];

function clearProcessChilds() {
  children.forEach(child => {
    child.kill('SIGINT');
  });
  children.length = 0;
}

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
      clearProcessChilds();
      process.exit(1);
      throw new Error('execution fail');
    }
    console.log('-- [cmd end]', cmdItem, '\n');
  }
}

executor.execSync = function(cmd) {
  return childProcess.execSync(cmd, { stdio: 'inherit' });
};

executor.fork = function(modulePath) {
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

executor.exit = function(code) {
  clearProcessChilds();
  process.exit(code || 0);
};

module.exports = executor;
