/**
 * Metro configuration for React Native
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

const { getDefaultConfig } = require('@react-native/metro-config');
const { mergeConfig } = require('metro-config');

const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');
const pack = require('../package.json');

const root = path.resolve(__dirname, '..');

const modules = Object.keys(pack.peerDependencies);

// Gesture handler tries to require 'react-native-reanimated' inside a try...catch
// block. In root directory, we have reanimated installed but FabricExample doesn't.
// We need to blacklist reanimated to prevent its JS code from bein in the bundle
// without the native code or the babel plugin.
modules.push('react-native-reanimated');

const config = {
  projectRoot: __dirname,
  watchFolders: [root],

  // We need to make sure that only one version is loaded for peerDependencies
  // So we exclude them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blacklistRE: exclusionList(
      modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
      )
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
