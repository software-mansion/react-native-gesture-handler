const { execSync } = require('child_process');

const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;
const BRANCH_REGEX = /^(\d+)\.(\d+)-stable$/;

function parseVersion(version) {
  return version.match(VERSION_REGEX).slice(1).map(Number)
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

module.exports = {
  parseVersion,
  getStableBranchVersion,
};
