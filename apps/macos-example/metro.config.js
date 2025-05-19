const { getDefaultConfig } = require('@react-native/metro-config');
const { mergeConfig } = require('metro-config');

const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escape = require('escape-string-regexp');

const gestureHandlerPackage = require('../../packages/react-native-gesture-handler/package.json');
const appPackage = require('./package.json');

const modulesBlacklist = Object.keys(gestureHandlerPackage.peerDependencies);
modulesBlacklist.push(...Object.keys(appPackage.dependencies));
modulesBlacklist.push(...Object.keys(appPackage.devDependencies));

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

config.resolver.extraNodeModules = modulesBlacklist.reduce((acc, name) => {
  // @ts-expect-error
  acc[name] = path.join(projectRoot, 'node_modules', name);
  return acc;
}, {});

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
