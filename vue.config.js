const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, './dist/app'),
  chainWebpack: config =>
    config.resolve.alias
      .set('@@', path.resolve(__dirname, './packages/'))
      .set('@', path.resolve(__dirname, './packages/app/src')),
};
