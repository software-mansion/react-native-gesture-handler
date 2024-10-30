module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.ts', '.tsx'],
          alias: {
            'react-native-gesture-handler/ReanimatedSwipeable':
              '../src/components/ReanimatedSwipeable',
            'react-native-gesture-handler': '../src/index',
          },
        },
      ],
      //react-native-reanimated/plugin has to be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};
