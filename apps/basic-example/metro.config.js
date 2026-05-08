const { getDefaultConfig } = require('@react-native/metro-config');
const { mergeConfig } = require('metro-config');

const path = require('path');

const exclusionList =
  require('metro-config/private/defaults/exclusionList').default;
const escape = require('escape-string-regexp');
const pack = require('./package.json');

const modulesBlacklist = Object.keys(pack.dependencies);
modulesBlacklist.push(...Object.keys(pack.devDependencies));
modulesBlacklist.push('react-native-gesture-handler');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const commonAppRoot = path.resolve(monorepoRoot, 'apps/common-app');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.blacklistRE = exclusionList(
  [monorepoRoot, commonAppRoot].flatMap((root) =>
    modulesBlacklist.map(
      (m) => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
    )
  )
);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});
