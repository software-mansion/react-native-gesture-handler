const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: ['@babel/polyfill', path.join(__dirname, 'index.web.js')],
  output: {
    path: path.join(__dirname, 'web'),
    filename: 'app.bundle.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        // Usually react-native* and react-navigation* modules need compilation
        exclude: /node_modules\/(?!react-native|@react-navigation|react-navigation)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              'module:metro-react-native-babel-preset',
              '@babel/preset-env',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              [
                'module-resolver',
                {
                  alias: {
                    'react-native-gesture-handler': '../',
                    react$: require.resolve('react'),
                    'react-native$': require.resolve('react-native-web'),
                    'react-dom$': require.resolve('react-dom'),
                    'react-art$': require.resolve('react-art'),
                  },
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=1000000',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
  ],
  resolve: {
    // If you're working on a multi-platform React Native app, web-specific
    // module implementations should be written in files using the extension
    // '.web.js'.
    symlinks: false,
    extensions: ['.web.js', '.js'],
  },
  devServer: {
    port: 8082,
    contentBase: [path.join(__dirname, 'web'), path.join(__dirname, 'dist')],
    historyApiFallback: true,
  },
};
