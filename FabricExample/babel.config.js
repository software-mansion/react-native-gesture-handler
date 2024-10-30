module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      //react-native-reanimated/plugin has to be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};
