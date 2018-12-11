const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './packages/lib/index.js'),

  output: {
    path: path.resolve(__dirname, './dist/lib'),
    filename: 'endpass-connect.js',
    library: 'EndpassConnect',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['lodash'],
        },
      },
    ],
  },

  node: {
    fs: 'empty',
  },

  resolve: {
    modules: [
      path.resolve('./node_modules'),
      path.resolve(__dirname, './packages'),
    ],
    alias: {
      '@@': path.resolve(__dirname, './packages/'),
    },
    extensions: ['.json', '.js'],
  },
};
