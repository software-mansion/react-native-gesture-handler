const { getDefaultConfig } = require('@react-native/metro-config');
const { mergeConfig } = require('metro-config');

const path = require('path');
const exclusionList =
  require('metro-config/private/defaults/exclusionList').default;
const escape = require('escape-string-regexp');

const modulesBlacklist = [];

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(__dirname);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.blacklistRE = exclusionList(
  modulesBlacklist.map(
    (m) =>
      new RegExp(`^${escape(path.join(monorepoRoot, 'node_modules', m))}\\/.*$`)
  )
);

// RNGH_PACKED=1 resolves react-native-gesture-handler from the vendored
// self-contained layout produced by scripts/vendor-for-pack.mjs — the Metro
// runtime verification of the 2-package publishing option.
if (process.env.RNGH_PACKED) {
  const packedEntry = path.resolve(
    monorepoRoot,
    'packages/react-native-gesture-handler/dist-pack/src/index.ts'
  );
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === 'react-native-gesture-handler') {
      return { type: 'sourceFile', filePath: packedEntry };
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
