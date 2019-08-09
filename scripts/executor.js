const childProcess = require('child_process');
const cleanup = require('./cleanup');

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
      childProcess.execSync(cmdItem, { stdio: 'inherit' });
    } catch (e) {
      console.error(e);
      clearProcessChilds();
      throw new Error('execution fail');
    }
    console.log('-- [cmd end]', cmdItem, '\n');
  }
}

executor.fork = function(modulePath, args, options) {
  const child = childProcess.fork(modulePath, args, options);
  children.push(child);
  cleanup(clearProcessChilds);
};

executor.exit = function(code) {
  clearProcessChilds();
  process.exit(code || 0);
};

module.exports = executor;
