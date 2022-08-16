module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    '@babel/plugin-transform-modules-commonjs',
    [
      'module-resolver',
      {
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
          'react-native-gesture-handler/DrawerLayout':
            '../src/components/DrawerLayout',
          'react-native-gesture-handler/Swipeable':
            '../src/components/Swipeable',
          'react-native-gesture-handler': '../src/index',
          'react': './node_modules/react',
          'react-native': './node_modules/react-native-web',
        },
      },
    ],
  ],
};
