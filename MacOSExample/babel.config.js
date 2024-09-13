module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    'react-native-reanimated/plugin',
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
  ],
};
