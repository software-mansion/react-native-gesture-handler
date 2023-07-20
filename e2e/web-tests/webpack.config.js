const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { getExpoBabelLoader } = require('@expo/webpack-config/utils');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['gesture-handler'],
      },
    },
    argv
  );
  const loader = getExpoBabelLoader(config);
  loader.use.options.configFile = './babel.config.web.js';
  return config;
};
