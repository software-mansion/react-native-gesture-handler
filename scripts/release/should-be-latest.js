const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion } = require('./parse-version');

function shouldBeLatest(version) {
  const latestVersion = getPackageVersionByTag('react-native-gesture-handler', 'latest');
  const [major, minor, patch] = parseVersion(latestVersion);
  const [newMajor, newMinor, newPatch] = parseVersion(version);

  // TODO: We'll worry about 3.x.x later :)
  return (newMajor === major && newMinor === minor && newPatch === patch + 1) ||
         (newMajor === major && newMinor === minor + 1 && newPatch === 0);
}

module.exports = {
  shouldBeLatest,
};
