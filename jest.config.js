module.exports = {
  preset: 'react-native',
  setupFiles: ['./jestSetup.js'],
  transformIgnorePatterns: [
    "node_modules/?!(react-native-reanimated)",
    "node_modules/?!(react-native)"
  ],
  roots: ["<rootDir>/src/"]
};
