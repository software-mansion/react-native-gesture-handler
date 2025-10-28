const fs = require('fs');
const { execSync } = require('child_process');
const { getPackageVersionByTag } = require('./npm-utils');
const { parseVersion } = require('./parse-version');

const PACKAGE_PATH = './packages/react-native-gesture-handler/package.json';
const BRANCH_REGEX = /^(\d+)\.(\d+)-stable$/;

function getLatestVersion() {
  const latestVersion = getPackageVersionByTag('react-native-gesture-handler', 'latest');
  
  try {
    return parseVersion(latestVersion);
  } catch (error) {
    throw new Error(`Failed to parse latest version: ${latestVersion}`);
  }
}

function getNextStableVersion() {
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  try {
    const [, major, minor] = currentBranch.match(BRANCH_REGEX);

    let nextPatch = 0;
    while (true) {
      const version = `${major}.${minor}.${nextPatch}`;
      
      try {
        getPackageVersionByTag('react-native-gesture-handler', version);
        nextPatch++;
      } catch (error) {
        return [Number(major), Number(minor), nextPatch];
      }
    }
  } catch (error) {
    throw new Error(`Failed to parse stable version: ${currentBranch}`);
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

    const commitlyVersion = `${major}.${minor + 1}.${0}-${currentDate}-${currentSHA.slice(0, 9)}`;
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

  console.log(`${version}`);
}

setPackageVersion();
