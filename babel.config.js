module.exports = function(api) {
  // Detect web usage (this may change in the future if Next.js changes the loader to `next-babel-loader`)
  const useExpoExamplePreset = api.caller(caller => {
    return caller && caller.mode === 'development' && caller.platform === 'web';
  });

  if (useExpoExamplePreset) {
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          require.resolve('babel-plugin-module-resolver'),
          {
            alias: {
              'react-native-gesture-handler': './',
              react: './node_modules/react',
              hammerjs: './node_modules/hammerjs',
              fbjs: './node_modules/fbjs',
              'hoist-non-react-statics':
                './node_modules/hoist-non-react-statics',
              invariant: './node_modules/invariant',
              'prop-types': './node_modules/prop-types',
            },
          },
        ],
      ],
    };
  }

  return {
    presets: ['babel-preset-expo'],
  };
};
