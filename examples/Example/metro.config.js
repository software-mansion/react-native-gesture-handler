const blacklist = require('metro-config/src/defaults/blacklist');
const path = require('path');

const glob = require('glob-to-regexp');

function getBlacklist() {
  const nodeModuleDirs = [
    glob(`${path.resolve(__dirname, '../..')}/node_modules/*`),
    glob(`${path.resolve(__dirname, '../..')}/e2e/*`),
    glob(`${path.resolve(__dirname)}/node_modules/*/node_modules/fbjs/*`),
    glob(
      `${path.resolve(
        __dirname
      )}/node_modules/react-native/node_modules/@babel/*`
    ),
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
    blocklist: getBlacklist(),
    resolverMainFields: ['browser', 'react-native', 'main'],
  },
  watchFolders: [path.resolve(__dirname, '../..')],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
