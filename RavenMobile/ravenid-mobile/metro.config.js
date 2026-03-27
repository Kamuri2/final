const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 🚀 EL PARCHE MAESTRO: Obliga a Metro a entender las exportaciones modernas de Apollo y tslib
config.resolver.unstable_enablePackageExports = true;

// Mantenemos la lectura de .cjs por seguridad
config.resolver.sourceExts.push("cjs");

module.exports = config;
