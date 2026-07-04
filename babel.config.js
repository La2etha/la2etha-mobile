module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo (SDK 57) auto-includes the react-native-worklets/reanimated
  // plugin when the package is installed, so no manual plugin entry is needed.
  return {
    presets: ['babel-preset-expo'],
  };
};
