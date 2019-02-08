const path = require('path');
const webpack = require('webpack');
const { getEnv } = require('./env');

const { NODE_ENV, SOURCE_MAP } = process.env;
const ENV = getEnv(NODE_ENV);

module.exports = {
  productionSourceMap: false,

  configureWebpack: {
    devtool: SOURCE_MAP && 'cheap-module-eval-source-map',

    plugins: [
      new webpack.DefinePlugin({
        ENV: JSON.stringify(ENV),
      }),
    ],
  },

  pluginOptions: {
    svgSprite: {
      /*
       * The directory containing your SVG files.
       */
      dir: 'src/assets/icons',
      /*
       * The reqex that will be used for the Webpack rule.
       */
      test: /\.(svg)(\?.*)?$/,
      /*
       * @see https://github.com/kisenka/svg-sprite-loader#configuration
       */
      loaderOptions: {
        extract: true,
        spriteFilename: 'img/icons.[hash:8].svg', // or 'img/icons.svg' if filenameHashing == false
      },
      /*
       * @see https://github.com/kisenka/svg-sprite-loader#configuration
       */
      pluginOptions: {
        plainSprite: true,
      },
    },
  },

  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve(__dirname, './src'));
    config.module
      .rule('svg-sprite')
      .use('svgo-loader')
      .loader('svgo-loader');
  },
  devServer: {
    proxy: {
      '^/identity/api/v1.1': {
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
