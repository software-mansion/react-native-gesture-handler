module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
          'react-native-gesture-handler': '../../src/index',
          'react': './node_modules/react',
        },
      },
    ],
  ],
};
