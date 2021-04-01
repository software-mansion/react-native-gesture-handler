module.exports = {
  root: true,
  extends: '@react-native-community',
  plugins: ['jest'],
  env: {
    'jest/globals': true,
    'detox/detox': true,
  },
};
