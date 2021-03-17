module.exports = {
  plugins: [
    ['@babel/plugin-transform-modules-umd', {
      exactGlobals: true,
      globals: {
        index: 'VueProps',
      },
    }],
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
          ie: '11',
        },
      },
    ],
  ],
};