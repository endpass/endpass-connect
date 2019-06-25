const path = require('path');

const pkg = require('./package.json');

const defaultConfig = {
  entry: pkg.umd,
  //  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'endpass-connect.min.js',
    library: 'EndpassConnect',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
};

// TODO: for old legacy browser urls, need remove after some time
const legacyBrowserConfig = {
  entry: pkg.umd,
  //  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'endpass-connect.browser.js',
    library: 'EndpassConnect',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
};

module.exports = [defaultConfig, legacyBrowserConfig];
