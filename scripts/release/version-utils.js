const { execSync } = require('child_process');

const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;
const BRANCH_REGEX = /^(\d+)\.(\d+)-stable$/;

function parseVersion(version) {
  const [, major, minor, patch] = version.match(VERSION_REGEX);
  return [Number(major), Number(minor), Number(patch)];
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
