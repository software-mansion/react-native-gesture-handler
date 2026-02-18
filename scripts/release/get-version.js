const { execSync } = require('child_process');
const { getStableBranchVersion, getLatestVersion, getNextPreReleaseVersion, getNextStableVersion, parseVersion } = require('./version-utils');
const { ReleaseType } = require('./parse-arguments');
const { getPackageVersionByTag } = require('./npm-utils');

function getVersion(releaseType, versionHint = null) {
  if (releaseType === ReleaseType.NIGHTLY) {
    let [major, minor] = getLatestVersion();

    if (major === 2) {
      // If the latest version is 2.x.x, we are still in the beta period for 3.x.x
      // Override the values so the resulting version is 3.0.0
      // TODO: Remove this once we have a stable 3.x.x release
      major = 3;
      minor = -1;
    }

    const currentSHA = execSync('git rev-parse HEAD').toString().trim().slice(0, 9);

    const latestNightlyVersion = getPackageVersionByTag('react-native-gesture-handler', 'nightly');
    const latestNightlySHA = latestNightlyVersion.split('-').pop();

    // Don't publish the same commit twice
    if (latestNightlySHA === currentSHA) {
      throw new Error(`Latest nightly version ${latestNightlyVersion} SHA ${latestNightlySHA} is the same as current SHA ${currentSHA}`);
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}${month}${day}`;

    const nightlyVersion = `${major}.${minor + 1}.${0}-nightly-${currentDate}-${currentSHA}`;
    return nightlyVersion;
  } else if (releaseType === ReleaseType.BETA || releaseType === ReleaseType.RELEASE_CANDIDATE) {
    let versionToUse = versionHint;

    if (!versionToUse) {
      versionToUse = getStableBranchVersion().slice(0, 2).join('.') + '.0';
    }

    return getNextPreReleaseVersion(releaseType, versionToUse);
  }

  const [major, minor, patch] = versionHint ? parseVersion(versionHint) : getNextStableVersion();
  return `${major}.${minor}.${patch}`;
}

module.exports = {
  getVersion,
};
