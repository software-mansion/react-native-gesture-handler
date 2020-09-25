module.exports = api => {
  const isWeb = api.caller(isTargetWeb);

  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      '@babel/plugin-transform-modules-commonjs',
      isWeb
        ? [
            'module-resolver',
            {
              alias: {
                'react-native-gesture-handler': '../..',
              },
            },
          ]
        : [
            'module-resolver',
            {
              alias: {
                '@babel': './node_modules/@babel',
                'react-native-gesture-handler': '../..',
                react: './node_modules/react',
                'react-native': './node_modules/react-native',
                '@egjs/hammerjs': './node_modules/@egjs/hammerjs',
                fbjs: './node_modules/fbjs',
                'hoist-non-react-statics':
                  './node_modules/hoist-non-react-statics',
                invariant: './node_modules/invariant',
                'prop-types': './node_modules/prop-types',
              },
            },
          ],
    ].filter(Boolean),
  };
};

function isTargetWeb(caller) {
  return caller && caller.name === 'babel-loader';
}
