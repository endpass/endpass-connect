const path = require('path');
const webpack = require('webpack');
const { getEnv } = require('./env');

const { NODE_ENV } = process.env;
const ENV = getEnv(NODE_ENV);

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        ENV: JSON.stringify(ENV),
      }),
    ],
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@@', path.resolve(__dirname, './packages/'))
      .set('@', path.resolve(__dirname, './packages/app/src'));
  },
  devServer: {
    proxy: {
      '/identity/api/v1.1': {
        target: ENV.identity.url,
        changeOrigin: true,
        pathRewrite: {
          '^/identity': '',
        },
        cookieDomainRewrite: 'localhost',
      },
    },
  },
  outputDir: path.resolve(__dirname, './dist/app'),
};
