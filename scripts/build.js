const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');

function exec(command) {
  execSync(command, {
    // Print stdin/stdout/stderr
    stdio: 'inherit',
  });
}

fs.stat(DIST_DIR, (error, stat) => {
  if (error || !stat.isDirectory()) {
    fs.mkdirSync(DIST_DIR);

    exec('npm install');
    exec('npm run build');
  }
});
