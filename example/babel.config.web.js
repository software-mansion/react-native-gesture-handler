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
            '../package/src/components/DrawerLayout',
          'react-native-gesture-handler/Swipeable':
            '../package/src/components/Swipeable',
          'react-native-gesture-handler': '../package/src/index',
          react: './node_modules/react',
          'react-native': './node_modules/react-native-web',
        },
      },
    ],
  ],
};
