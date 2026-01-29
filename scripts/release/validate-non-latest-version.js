const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion } = require('./version-utils');

function versionExists(version) {
  try {
    getPackageVersionByTag('react-native-gesture-handler', version);
    return true;
  } catch (error) {
    return false;
  }
}

function validateNonLatestVersion(version) {
  const [newMajor, newMinor, newPatch, _] = parseVersion(version);
  
  if (versionExists(`${newMajor}.${newMinor}.${newPatch}`)) {
    throw new Error(`Version ${newMajor}.${newMinor}.${newPatch} already exists in the npm registry`);
  }

  return true;
}

if (require.main === module) {
  const version = process.argv[2];
  console.log(validateNonLatestVersion(version));
}

module.exports = {
  validateNonLatestVersion,
};
