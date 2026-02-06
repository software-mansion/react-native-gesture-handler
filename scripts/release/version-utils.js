const { execSync } = require('child_process');
const { getPackageVersionByTag } = require('./npm-utils');

const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)(-.*)?$/;
const BRANCH_REGEX = /^(\d+)\.(\d+)-stable$/;

function parseVersion(version) {
  const match = version.match(VERSION_REGEX);
  if (!match) {
    throw new Error(`Invalid version string: ${version}`);
  }
  const [, major, minor, patch, preRelease] = match;
  return [Number(major), Number(minor), Number(patch), preRelease || null];
}

function getStableBranchVersion() {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  try {
    const [, major, minor] = currentBranch.match(BRANCH_REGEX);
    return [Number(major), Number(minor)];
  } catch (error) {
    throw new Error(`Failed to parse stable version from branch: ${currentBranch}`);
  }
}

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

module.exports = {
  parseVersion,
  getStableBranchVersion,
  getNextStableVersion,
  getNextPreReleaseVersion,
  getLatestVersion,
};
