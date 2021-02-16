module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    [
      'module-resolver',
      {
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
          'react-native-gesture-handler/DrawerLayout':
            '../../src/components/DrawerLayout',
          'react-native-gesture-handler/Swipeable':
            '../../src/components/Swipeable',
          'react-native-gesture-handler': '../../src/index',
          'react': './node_modules/react',
          'react-native': './node_modules/react-native',
          '@babel': './node_modules/@babel',
          '@egjs/hammerjs': './node_modules/@egjs/hammerjs',
          'fbjs': './node_modules/fbjs',
          'hoist-non-react-statics': './node_modules/hoist-non-react-statics',
          'invariant': './node_modules/invariant',
          'prop-types': './node_modules/prop-types',
        },
      },
    ],
  ],
};
