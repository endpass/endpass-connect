const { execSync } = require('child_process');

function executor(cmd) {
  if (!Array.isArray(cmd)) {
    // eslint-disable-next-line
    cmd = [cmd];
  }
  cmd.forEach((cmdItem) => {
    console.log('-- [cmd start]', cmdItem);
    execSync(cmdItem, { stdio: 'inherit' });
    console.log('-- [cmd end]', cmdItem, '\n');
  });
}

module.exports = executor;
