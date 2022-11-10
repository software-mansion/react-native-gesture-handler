module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    'react-native-reanimated/plugin',
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
          'react-native': './node_modules/react-native',
          'react-native-reanimated': './node_modules/react-native-reanimated',
          '@babel': './node_modules/@babel',
          '@egjs/hammerjs': './node_modules/@egjs/hammerjs',
          fbjs: './node_modules/fbjs',
          'hoist-non-react-statics': './node_modules/hoist-non-react-statics',
          invariant: './node_modules/invariant',
        },
      },
    ],
  ],
};
