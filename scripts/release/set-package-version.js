const fs = require('fs');
const { execSync } = require('child_process');
const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion, getStableBranchVersion } = require('./version-utils');

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

function getVersion(isCommitly) {
  if (isCommitly) {
    const [major, minor] = getLatestVersion()

    const currentSHA = execSync('git rev-parse HEAD').toString().trim();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDate = `${year}${month}${day}`;

    const commitlyVersion = `${major}.${minor + 1}.${0}-nightly-${currentDate}-${currentSHA.slice(0, 9)}`;
    return commitlyVersion;
  }

  const [major, minor, patch] = getNextStableVersion();
  return `${major}.${minor}.${patch}`;
}

function setPackageVersion() {
  const isCommitly = process.argv.includes('--commitly');
  const version = getVersion(isCommitly);
  
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2));

  // Intentional, this is consumed by the action
  console.log(version);
}

setPackageVersion();
