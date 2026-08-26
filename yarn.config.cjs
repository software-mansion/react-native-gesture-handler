module.exports = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async constraints({ Yarn }) {
    const sharedVersions = {
      'react-native-reanimated': '4.6.0',
      'react-native-worklets': '0.12.1',
    };

    for (const [ident, expectedVersion] of Object.entries(sharedVersions)) {
      for (const dependency of Yarn.dependencies({ ident })) {
        if (dependency.workspace.ident === 'macos-example') {
          continue;
        }
        dependency.update(expectedVersion);
      }
    }
  },
};
