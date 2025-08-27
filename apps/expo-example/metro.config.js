const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const exclusionList = require('metro-config/private/defaults/exclusionList');
const escape = require('escape-string-regexp');
const pack = require('./package.json');

const modulesBlacklist = Object.keys(pack.dependencies);
modulesBlacklist.push(...Object.keys(pack.devDependencies));

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

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

module.exports = config;
