const path = require('path');

const { NODE_ENV } = process.env;

module.exports = {
  mode: NODE_ENV || 'production',

  entry: path.resolve(__dirname, './packages/lib/index.js'),

  devtool: NODE_ENV === 'development' ? 'cheap-module-source-map' : false,

  output: {
    path: path.resolve(__dirname, './dist/lib'),
    filename: 'endpass-connect.js',
    library: 'EndpassConnect',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    modules: [
      path.resolve('./node_modules'),
      path.resolve(__dirname, './packages'),
    ],
    extensions: ['.json', '.js'],
  },
};
