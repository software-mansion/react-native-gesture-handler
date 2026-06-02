module.exports = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async constraints({ Yarn }) {
    const sharedVersions = {
      'react-native-reanimated': '~4.3.1',
      'react-native-worklets': '0.8.1',
    };

    for (const [ident, expectedVersion] of Object.entries(sharedVersions)) {
      for (const dependency of Yarn.dependencies({ ident })) {
        dependency.update(expectedVersion);
      }
    }
  },
};
