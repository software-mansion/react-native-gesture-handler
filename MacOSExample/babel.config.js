module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-transform-private-methods', { loose: true }],
    [
      'module-resolver',
      {
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
          react: './node_modules/react',
          'react-native': './node_modules/react-native-macos',
          'react-native-reanimated': './node_modules/react-native-reanimated',
          'react-native-gesture-handler/ReanimatedSwipeable':
            '../src/components/ReanimatedSwipeable',
          'react-native-gesture-handler/Swipeable':
            '../src/components/Swipeable',
          'react-native-gesture-handler': '../src/index',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
