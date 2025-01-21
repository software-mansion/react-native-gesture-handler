module.exports = {
  preset: 'react-native',
  setupFiles: ['./jestSetup.js'],
  setupFilesAfterEnv: ['./jestSetupAfterEnv.js'],
  transformIgnorePatterns: [
    "node_modules/?!(react-native-reanimated)",
    "node_modules/?!(react-native)"
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/lib/"
  ],
  roots: ["<rootDir>/src/"]
};
