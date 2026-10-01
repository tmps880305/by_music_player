// Config plugin: keep the iOS app iPhone-only. `ios.supportsTablet: false` already limits the device family to iPhone,
// but Xcode still offers "Designed for iPhone" destinations on Apple Silicon Macs and Apple Vision Pro. This turns
// those off (and Mac Catalyst) for the app target on every `expo prebuild`, so the setting survives regeneration.
const { withXcodeProject } = require('expo/config-plugins');

module.exports = function withIphoneOnly(config) {
  return withXcodeProject(config, mod => {
    const configurations = mod.modResults.pbxXCBuildConfigurationSection();
    for (const entry of Object.values(configurations)) {
      const settings = entry && entry.buildSettings;
      // Only the app target's configurations carry a bundle identifier.
      if (!settings || !settings.PRODUCT_BUNDLE_IDENTIFIER) continue;
      settings.SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD = 'NO';
      settings.SUPPORTS_XR_DESIGNED_FOR_IPHONE_IPAD = 'NO';
      settings.SUPPORTS_MACCATALYST = 'NO';
    }
    return mod;
  });
};
