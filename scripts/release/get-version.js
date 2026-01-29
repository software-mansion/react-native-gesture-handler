const { execSync } = require('child_process');
const { getStableBranchVersion, getLatestVersion, getNextPreReleaseVersion, getNextStableVersion } = require('./version-utils');
const { ReleaseType } = require('./parse-arguments');

function getVersion(releaseType, preReleaseVersion = null) {
  if (releaseType === ReleaseType.COMMITLY) {
    const [major, minor] = getLatestVersion();

    const currentSHA = execSync('git rev-parse HEAD').toString().trim();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}${month}${day}`;

    const commitlyVersion = `${major}.${minor + 1}.${0}-nightly-${currentDate}-${currentSHA.slice(0, 9)}`;
    return commitlyVersion;
  } else if (releaseType === ReleaseType.BETA || releaseType === ReleaseType.RELEASE_CANDIDATE) {
    let versionToUse = preReleaseVersion;

    if (!versionToUse) {
      versionToUse = getStableBranchVersion().slice(0, 2).join('.') + '.0';
    }

    if (versionToUse == null) {
      throw new Error(`Could not determine base version for pre-release type: ${releaseType}`);
    }

    return getNextPreReleaseVersion(releaseType, versionToUse);
  }

  const [major, minor, patch] = getNextStableVersion();
  return `${major}.${minor}.${patch}`;
}

module.exports = {
  getVersion,
};
