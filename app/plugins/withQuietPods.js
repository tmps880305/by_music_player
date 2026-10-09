// Config plugin: silence compiler warnings from third-party pods (React Native, Expo modules, svg, gesture handler, …).
// Those few hundred warnings live in node_modules / Pods, can't be fixed here and bury the ones that matter.
// Applied on every `expo prebuild`:
// - Pod targets: inhibit all C/ObjC and Swift warnings.
// - Every Swift target (pods and the app): pass `-Xcc -w` so the clang modules Swift precompiles from the prebuilt
//   React / Expo framework headers stop reporting header warnings (nullability, umbrella headers, …). The app's own
//   Swift code still gets Swift warnings.
const { withPodfile, withXcodeProject } = require('expo/config-plugins');

const MARKER = '# withQuietPods';
const SNIPPET = `
    ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['GCC_WARN_INHIBIT_ALL_WARNINGS'] = 'YES'
        build_config.build_settings['SWIFT_SUPPRESS_WARNINGS'] = 'YES'
        swift_flags = build_config.build_settings['OTHER_SWIFT_FLAGS'] || '$(inherited)'
        build_config.build_settings['OTHER_SWIFT_FLAGS'] = "#{swift_flags} -Xcc -w" unless swift_flags.include?('-Xcc -w')
      end
    end`;

const withQuietPodTargets = config =>
  withPodfile(config, mod => {
    const podfile = mod.modResults;
    if (!podfile.contents.includes(MARKER)) {
      podfile.contents = podfile.contents.replace(/post_install do \|installer\|/, match => match + SNIPPET);
    }
    return mod;
  });

const withQuietAppHeaders = config =>
  withXcodeProject(config, mod => {
    const configurations = mod.modResults.pbxXCBuildConfigurationSection();
    for (const entry of Object.values(configurations)) {
      const settings = entry && entry.buildSettings;
      // Only the app target's configurations carry a bundle identifier.
      if (!settings || !settings.PRODUCT_BUNDLE_IDENTIFIER) continue;
      const flags = (settings.OTHER_SWIFT_FLAGS || '"$(inherited)"').replace(/^"|"$/g, '');
      if (!flags.includes('-Xcc -w')) settings.OTHER_SWIFT_FLAGS = `"${flags} -Xcc -w"`;
    }
    return mod;
  });

module.exports = config => withQuietAppHeaders(withQuietPodTargets(config));
