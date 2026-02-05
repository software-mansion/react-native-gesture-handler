const assert = require('assert');

const ReleaseType = {
  STABLE: 'stable',
  BETA: 'beta',
  RELEASE_CANDIDATE: 'rc',
  COMMITLY: 'commitly',
};

function parseArguments() {
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

  assert([isCommitly, isBeta, isReleaseCandidate].filter(Boolean).length <= 1, 'Release flags --commitly, --beta, and --rc are mutually exclusive; specify at most one');
  assert(version === null || isBeta || isReleaseCandidate || !isCommitly, 'Version should not be provided for commitly releases');

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

  return { releaseType, version };
}

module.exports = {
  ReleaseType,
  parseArguments,
};
