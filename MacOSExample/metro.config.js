const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');
const pack = require('../package.json');
const { getDefaultConfig } = require('expo/metro-config');

const root = path.resolve(__dirname, '..');

const modules = Object.keys(pack.peerDependencies);

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

config.projectRoot = __dirname;
config.watchFolders = [root];

// We need to make sure that only one version is loaded for peerDependencies
// So we exclude them at the root, and alias them to the versions in example's node_modules

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'macos') {
    if (moduleName.startsWith('react-native')) {
      const resolvedFilepath = moduleName.replace(
        'react-native',
        'react-native-macos'
      );
      return {
        filePath: require.resolve(resolvedFilepath),
        type: 'sourceFile',
      };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.blacklistRE = exclusionList(
  modules.map(
    (m) => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
  )
);

config.resolver.extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
