const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion } = require('./version-utils');

function validateLatestVersion(version) {
  const [newMajor, newMinor, newPatch, newPreRelease] = parseVersion(version);
  const latestVersion = getPackageVersionByTag('react-native-gesture-handler', 'latest');
  const [major, minor, patch] = parseVersion(latestVersion);

  if (newPreRelease !== null) {
    throw new Error(`Pre-release version ${version} cannot be the latest version`);
  }

  if (newMajor < major) {
    throw new Error(`New major version ${newMajor} is less than latest major version ${major}`);
  }

  // TODO: We'll worry about 3.x.x later :)
  if (newMajor !== major) {
    throw new Error(`Expected major version to be ${major}, but got ${newMajor}`);
  }

  const isValid = (newMajor === major && newMinor === minor && newPatch === patch + 1) ||
         (newMajor === major && newMinor === minor + 1 && newPatch === 0) ||
         (newMajor === major + 1 && newMinor === 0 && newPatch === 0);

  if (!isValid) {
    throw new Error(`Version ${version} is not a valid latest version based on latest published version ${latestVersion}`);
  }

  return true;
}

if (require.main === module) {
  const version = process.argv[2];
  console.log(validateLatestVersion(version));
}

module.exports = {
  validateLatestVersion,
};
