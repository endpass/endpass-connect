module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions'],
        },
        modules: false,
      },
    ],
    ["@babel/preset-typescript"],
  ],
  env: {
    test: {
      presets: ['@babel/preset-env'],
      plugins: [['@babel/plugin-transform-runtime']],
    },
  },
};
