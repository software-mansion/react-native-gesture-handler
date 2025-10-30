const { execSync } = require('child_process');

function getPackageVersionByTag(packageName, tag) {
  const npmString =
    tag != null
      ? `npm view ${packageName}@${tag} version`
      : `npm view ${packageName} version`;

  try {
    const result = execSync(npmString, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    return result;
  } catch (error) {
    throw new Error(`Failed to get package version for ${packageName} by tag: ${tag}`);
  }
}

module.exports = {
  getPackageVersionByTag,
};
