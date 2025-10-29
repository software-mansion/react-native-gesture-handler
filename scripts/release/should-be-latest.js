const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion } = require('./version-utils');

function shouldBeLatest(version) {
  const latestVersion = getPackageVersionByTag('react-native-gesture-handler', 'latest');
  const [major, minor, patch] = parseVersion(latestVersion);
  const [newMajor, newMinor, newPatch] = parseVersion(version);

  // TODO: We'll worry about 3.x.x later :)
  if (newMajor !== major) {
    throw new Error(`Expected major version to be ${major}, but got ${newMajor}`);
  }

  return (newMajor === major && newMinor === minor && newPatch === patch + 1) ||
         (newMajor === major && newMinor === minor + 1 && newPatch === 0);
}

if (require.main === module) {
  const version = process.argv[2];
  console.log(shouldBeLatest(version));
}

module.exports = {
  shouldBeLatest,
};
