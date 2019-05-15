const blacklist = require('metro-config/src/defaults/blacklist');
const path = require('path');
const pkg = require('./package.json');

const glob = require('glob-to-regexp');

function getBlacklist() {
  const nodeModuleDirs = [
    glob(`${path.resolve(__dirname, '..')}/node_modules/*`),
    glob(`${path.resolve(__dirname, '..')}/e2e/*`),
    glob(`${path.resolve(__dirname)}/node_modules/*/node_modules/fbjs/*`),
    glob(
      `${path.resolve(
        __dirname
      )}/node_modules/*/node_modules/hoist-non-react-statics/*`
    ),
  ];
  return blacklist(nodeModuleDirs);
}

module.exports = {
  resolver: {
    blacklistRE: getBlacklist(),
    providesModuleNodeModules: Object.keys(pkg.dependencies),
  },
  watchFolders: [path.resolve(__dirname, '..')],
};
