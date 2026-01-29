const fs = require('fs');
const { execSync } = require('child_process');
const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion, getStableBranchVersion } = require('./version-utils');
const { parseArguments, ReleaseType } = require('./parse-arguments');

const PACKAGE_PATH = './packages/react-native-gesture-handler/package.json';

function getLatestVersion() {
  const latestVersion = getPackageVersionByTag('react-native-gesture-handler', 'latest');
  
  try {
    return parseVersion(latestVersion);
  } catch (error) {
    throw new Error(`Failed to parse latest version: ${latestVersion}`);
  }
}

function getNextStableVersion() {
  const [major, minor] = getStableBranchVersion();

  // TODO: We'll worry about 3.x.x later :)
  if (major !== 2) {
    throw new Error(`Expected major version to be 2, but got ${major}`);
  }

  let nextPatch = 0;
  while (true) {
    const version = `${major}.${minor}.${nextPatch}`;
    
    try {
      // if the version is already published, increment the patch version and try again
      getPackageVersionByTag('react-native-gesture-handler', version);
      nextPatch++;
    } catch (error) {
      return [Number(major), Number(minor), nextPatch];
    }
  }
}

function getNextPreReleaseVersion(releaseType, version) {
  let dotIndex = 1;
  while (true) {
    const targetVersion = `${version}-${releaseType}.${dotIndex}`;
    
    try {
      // if the version is already published, increment the pre-release sequence (rc/beta number) and try again
      getPackageVersionByTag('react-native-gesture-handler', targetVersion);
      dotIndex++;
    } catch (error) {
      return targetVersion;
    }
  }
}

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
