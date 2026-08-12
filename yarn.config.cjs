module.exports = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async constraints({ Yarn }) {
    const sharedVersions = {
      'react-native-reanimated': '4.6.0-nightly-20260811-248dee712',
      'react-native-worklets':
        'patch:react-native-worklets@npm%3A0.12.0-nightly-20260810-fb9cb5596#~/.yarn/patches/react-native-worklets-npm-0.12.0-nightly-20260810-fb9cb5596-f08a72b88e.patch',
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
