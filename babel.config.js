module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    ['@babel/preset-typescript'],
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: true,
        regenerator: true,
      },
    ],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
  env: {
    test: {
      presets: ['@babel/preset-env'],
      plugins: [
        ['@babel/plugin-syntax-dynamic-import'], // for @endpass/class only
        [
          '@babel/plugin-transform-runtime',
          {
            helpers: true,
            regenerator: true,
          },
        ],
      ],
    },
  },
};
