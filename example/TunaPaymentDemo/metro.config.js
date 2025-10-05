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

module.exports = config;