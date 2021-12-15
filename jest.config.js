module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: ['example', 'docs', 'lib'],
  setupFiles: ['./jest-setup.js'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    "node_modules/?!(react-native-reanimated)",
    "node_modules/?!(react-native)"
  ]
};
