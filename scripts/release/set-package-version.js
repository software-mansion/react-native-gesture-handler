const fs = require('fs');
const { execSync } = require('child_process');
const { getStableBranchVersion, getLatestVersion, getNextPreReleaseVersion, getNextStableVersion } = require('./version-utils');
const { parseArguments, ReleaseType } = require('./parse-arguments');

const PACKAGE_PATH = './packages/react-native-gesture-handler/package.json';

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

function setPackageVersion() {
  const { releaseType, version: preReleaseVersion } = parseArguments();

  const version = getVersion(releaseType, preReleaseVersion);
  
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2));

  // Intentional, this is consumed by the action
  console.log(version);
}

if (require.main === module) {
  setPackageVersion();
}
