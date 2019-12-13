const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.alias['react-native-gesture-handler'] = path.resolve(
    __dirname,
    '../'
  );
  // Customize the config before returning it.
  return config;
};
