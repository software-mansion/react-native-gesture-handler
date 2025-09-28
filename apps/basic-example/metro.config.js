const { getDefaultConfig } = require('@react-native/metro-config');
const { mergeConfig } = require('metro-config');

const path = require('path');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;
const escape = require('escape-string-regexp');

// Gesture handler tries to require 'react-native-reanimated' inside a try...catch
// block. In root directory, we have reanimated installed but FabricExample doesn't.
// We need to blacklist reanimated to prevent its JS code from bein in the bundle
// without the native code or the babel plugin.
const modulesBlacklist = ['react-native-reanimated'];

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

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
