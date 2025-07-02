module.exports = {
  preset: 'react-native',
  setupFiles: ['./jestSetup.js'],
  transformIgnorePatterns: [
    "node_modules/?!(react-native)"
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/lib/"
  ],
  roots: ["<rootDir>/src/"]
};
