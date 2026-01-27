const fs = require('fs');
const { execSync } = require('child_process');
const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion, getStableBranchVersion } = require('./version-utils');
const assert = require('assert');

const PACKAGE_PATH = './packages/react-native-gesture-handler/package.json';

const ReleaseType = {
  STABLE: 'stable',
  BETA: 'beta',
  RELEASE_CANDIDATE: 'rc',
  COMMITLY: 'commitly',
};

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
      // if the version is already published, increment the patch version and try again
      getPackageVersionByTag('react-native-gesture-handler', targetVersion);
      dotIndex++;
    } catch (error) {
      return targetVersion;
    }
  }
}

function getVersion(releaseType, preReleaseVersion = null) {
  if (releaseType === ReleaseType.COMMITLY) {
    const [major, minor] = getLatestVersion()

    const currentSHA = execSync('git rev-parse HEAD').toString().trim();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}${month}${day}`;

    const commitlyVersion = `${major}.${minor + 1}.${0}-nightly-${currentDate}-${currentSHA.slice(0, 9)}`;
    return commitlyVersion;
  } else if (releaseType === ReleaseType.BETA || releaseType === ReleaseType.RELEASE_CANDIDATE) {
    if (preReleaseVersion == null) {
      throw new Error(`Version must be provided for ${releaseType} releases`);
    }

    return getNextPreReleaseVersion(releaseType, preReleaseVersion);
  }

  const [major, minor, patch] = getNextStableVersion();
  return `${major}.${minor}.${patch}`;
}

function setPackageVersion() {
  let version = null;
  let isCommitly = false;
  let isBeta = false;
  let isReleaseCandidate = false;

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--commitly') {
      isCommitly = true;
    } else if (arg === '--beta') {
      isBeta = true;
    } else if (arg === '--rc') {
      isReleaseCandidate = true;
    } else if (arg === '--version') {
      if (i + 1 < process.argv.length) {
        version = process.argv[i + 1];
        i++;
      } else {
        throw new Error('Expected a version after --version');
      }
    }
  }

  assert([isCommitly, isBeta, isReleaseCandidate].filter(Boolean).length <= 1, 'Release cannot be commitly, beta, and release candidate at the same time');
  assert(version === null || isBeta || isReleaseCandidate, 'Version should not be provided for stable nor commitly releases');
  assert(version !== null || (!isBeta && !isReleaseCandidate), 'Version must be provided for beta and release candidate releases');

  const releaseType = isCommitly
    ? ReleaseType.COMMITLY
    : isBeta
      ? ReleaseType.BETA
      : isReleaseCandidate
        ? ReleaseType.RELEASE_CANDIDATE
        : ReleaseType.STABLE;

  if (version != null) {
    const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;
    if (!versionRegex.test(version)) {
      throw new Error(`Provided version "${version}" is not valid. Expected format: x.y.z`);
    }
  }

  version = getVersion(releaseType, version);
  
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2));

  // Intentional, this is consumed by the action
  console.log(version);
}

if (require.main === module) {
  setPackageVersion();
}
