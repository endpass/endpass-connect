const webpackPreprocess = require('@cypress/webpack-preprocessor');
const path = require('path');

module.exports = on => {
  const options = {
    webpackOptions: {
      resolve: {
        alias: {
          '@fixtures': path.resolve(__dirname, '../../fixtures'),
          '@config': path.resolve(__dirname, '../support/config'),
          '@': path.resolve(__dirname, '../../../src'),
        },
      },
    },
    watchOptions: {},
  };
  on('file:preprocessor', webpackPreprocess(options));
};
