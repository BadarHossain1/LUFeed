const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

// Add support for web-specific extensions
config.resolver.sourceExts.push('web.js');
config.resolver.sourceExts.push('web.ts');
config.resolver.sourceExts.push('web.tsx');

// Add assetExts for web
config.resolver.assetExts.push('pem');

module.exports = config;