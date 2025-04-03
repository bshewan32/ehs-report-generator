const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    path: require.resolve("path-browserify"),
    os: require.resolve("os-browserify/browser"),
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer/"),
    util: require.resolve("util/"),
  };

  // Ensure plugins array exists
  config.plugins = config.plugins || [];

  // Add buffer and process polyfills
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: require.resolve("process/browser.js"),
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};