const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const exclusionList =
  require('metro-config/private/defaults/exclusionList').default;
const escape = require('escape-string-regexp');
const pack = require('./package.json');

const modulesBlacklist = Object.keys(pack.dependencies);
modulesBlacklist.push(...Object.keys(pack.devDependencies));

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const commonAppRoot = path.resolve(monorepoRoot, 'apps/common-app');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

const monorepoExclusions = [monorepoRoot, commonAppRoot].flatMap((root) =>
  modulesBlacklist.map(
    (m) => new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
  )
);

// Concat arrays before passing to exclusionList to prevent runtime crash
config.resolver.blacklistRE = exclusionList(
  monorepoExclusions.concat([
    // Regex [\/\\] ensures cross-platform compatibility (macOS/Linux/Windows)
    /.*[\/\\]\.rnrepo-cache[\/\\].*/
  ])
);

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
