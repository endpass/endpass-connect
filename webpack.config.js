const path = require('path');

const pkg = require('./package.json');

const createConfig = ({ entry, filename, library }) => {
  return {
    entry,
    //  devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename,
      library,
      libraryExport: 'default',
      libraryTarget: 'umd',
    },
  };
};

const defaultConfig = createConfig({
  entry: pkg.umd,
  filename: 'endpass-connect.min.js',
  library: 'EndpassConnect',
});

// TODO: for old legacy browser urls, need remove after some time
const legacyBrowserConfig = createConfig({
  entry: pkg.umd,
  filename: 'endpass-connect.browser.js',
  library: 'EndpassConnect',
});

module.exports = [defaultConfig, legacyBrowserConfig];
