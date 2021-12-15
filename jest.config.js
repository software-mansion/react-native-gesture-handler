module.exports = {
  preset: 'react-native',
  setupFiles: ['./jestSetup.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    "node_modules/?!(react-native-reanimated)",
    "node_modules/?!(react-native)"
  ]
};
