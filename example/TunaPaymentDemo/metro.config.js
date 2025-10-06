const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the parent directories to watch folders
config.watchFolders = [
  path.resolve(__dirname, '../../'), // Include the react-native plugin root
];

// Add the dist directory to the resolver
config.resolver.alias = {
  '@tuna/react-native': path.resolve(__dirname, '../../dist'),
};

// Prevent writing to app bundle (fixes sandbox violation)
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      // Block any attempts to write debug files to bundle
      if (req.url && (req.url.includes('ip.txt') || req.url.includes('.app/'))) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('blocked');
        return;
      }
      return middleware(req, res, next);
    };
  }
};

module.exports = config;