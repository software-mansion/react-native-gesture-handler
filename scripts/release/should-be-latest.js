const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion } = require('./version-utils');

function shouldBeLatest(version) {
  const [newMajor, newMinor, newPatch, newPreRelease] = parseVersion(version);

  // Pre-releases should never be latest
  if (newPreRelease !== null) {
    return false;
  }

  const latestVersion = getPackageVersionByTag('react-native-gesture-handler', 'latest');
  const [major, minor, patch] = parseVersion(latestVersion);

  return (newMajor === major && newMinor === minor && newPatch >= patch + 1) ||
         (newMajor === major && newMinor >= minor + 1) ||
         (newMajor >= major + 1);
}

if (require.main === module) {
  const version = process.argv[2];
  console.log(shouldBeLatest(version));
}

module.exports = {
  shouldBeLatest,
};
