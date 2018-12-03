const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

const DIST_PATH = path.resolve(__dirname, '../dist');
const LIB_PATTERN = /^(endpass-connect|demo)/;

const normalizeDir = async dir => {
  try {
    await readdir(path.resolve(DIST_PATH, dir));
  } catch (err) {
    await mkdir(path.resolve(DIST_PATH, dir));
  }
};

(async () => {
  try {
    const files = await readdir(DIST_PATH);

    await normalizeDir('lib');
    await normalizeDir('app');

    /* eslint-disable */
    for (const file of files) {
      if (LIB_PATTERN.test(file)) {
        await rename(
          path.resolve(DIST_PATH, file),
          path.resolve(DIST_PATH, `lib/${file}`),
        );
      } else {
        await rename(
          path.resolve(DIST_PATH, file),
          path.resolve(DIST_PATH, `app/${file}`),
        );
      }
    }
    /* eslint-enable */
  } catch (err) {
    /* eslint-disable-next-line */
    console.error(`Dist folder is not exist, build lib first!\n${err}`);
    process.exit(1);
  }
})();
