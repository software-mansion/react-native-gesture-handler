module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jestSetup.js'],
  transformIgnorePatterns: [
    'node_modules/?!(react-native-reanimated)',
    'node_modules/?!(react-native)',
  ],
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  roots: ['<rootDir>/src/'],
};
