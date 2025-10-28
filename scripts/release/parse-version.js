const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

function parseVersion(version) {
  const [, major, minor, patch] = version.match(VERSION_REGEX);
  return [Number(major), Number(minor), Number(patch)];
}

module.exports = {
  parseVersion,
};