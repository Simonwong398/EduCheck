module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    'module:metro-react-native-babel-preset'
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', { regenerator: true }],
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@': './',
        '@app': './EduCheckApp'
      }
    }]
  ]
};
