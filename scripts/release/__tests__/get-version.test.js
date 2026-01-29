jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('../version-utils', () => ({
  getStableBranchVersion: jest.fn(),
  getLatestVersion: jest.fn(),
  getNextPreReleaseVersion: jest.fn(),
  getNextStableVersion: jest.fn(),
}));

const { execSync } = require('child_process');
const { getStableBranchVersion, getLatestVersion, getNextPreReleaseVersion, getNextStableVersion } = require('../version-utils');
const { getVersion } = require('../get-version');
const { ReleaseType } = require('../parse-arguments');

describe('get-version', () => {
  const RealDate = Date;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date for consistent nightly version testing
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return new RealDate('2026-01-29T12:00:00Z');
        }
        return new RealDate(...args);
      }
    };
  });

  afterEach(() => {
    global.Date = RealDate;
  });

  describe('getVersion', () => {
    // Commitly/nightly release tests
    describe('commitly releases', () => {
      test('returns nightly version with date and SHA', () => {
        getLatestVersion.mockReturnValue([2, 22, 0, null]);
        execSync.mockReturnValue(Buffer.from('abc123def456789\n'));

        const result = getVersion(ReleaseType.COMMITLY);

        expect(result).toBe('2.23.0-nightly-20260129-abc123def');
        expect(getLatestVersion).toHaveBeenCalled();
        expect(execSync).toHaveBeenCalledWith('git rev-parse HEAD');
      });

      test('increments minor version from latest', () => {
        getLatestVersion.mockReturnValue([2, 25, 3, null]);
        execSync.mockReturnValue(Buffer.from('fedcba987654321\n'));

        const result = getVersion(ReleaseType.COMMITLY);

        expect(result).toBe('2.26.0-nightly-20260129-fedcba987');
      });

      test('uses first 9 characters of SHA', () => {
        getLatestVersion.mockReturnValue([2, 22, 0, null]);
        execSync.mockReturnValue(Buffer.from('123456789abcdef0\n'));

        const result = getVersion(ReleaseType.COMMITLY);

        expect(result).toContain('-123456789');
        expect(result).not.toContain('abcdef0');
      });

      test('formats date correctly', () => {
        global.Date = class extends RealDate {
          constructor(...args) {
            if (args.length === 0) {
              return new RealDate('2026-12-05T12:00:00Z');
            }
            return new RealDate(...args);
          }
        };
        getLatestVersion.mockReturnValue([2, 22, 0, null]);
        execSync.mockReturnValue(Buffer.from('abc123def\n'));

        const result = getVersion(ReleaseType.COMMITLY);

        expect(result).toContain('-nightly-20261205-');
      });

      test('pads single digit month and day', () => {
        global.Date = class extends RealDate {
          constructor(...args) {
            if (args.length === 0) {
              return new RealDate('2026-03-07T12:00:00Z');
            }
            return new RealDate(...args);
          }
        };
        getLatestVersion.mockReturnValue([2, 22, 0, null]);
        execSync.mockReturnValue(Buffer.from('abc123def\n'));

        const result = getVersion(ReleaseType.COMMITLY);

        expect(result).toContain('-nightly-20260307-');
      });
    });

    // Beta release tests
    describe('beta releases', () => {
      test('returns beta version with provided base version', () => {
        getNextPreReleaseVersion.mockReturnValue('2.22.0-beta.1');

        const result = getVersion(ReleaseType.BETA, '2.22.0');

        expect(result).toBe('2.22.0-beta.1');
        expect(getNextPreReleaseVersion).toHaveBeenCalledWith(ReleaseType.BETA, '2.22.0');
      });

      test('derives base version from stable branch when not provided', () => {
        getStableBranchVersion.mockReturnValue([2, 23]);
        getNextPreReleaseVersion.mockReturnValue('2.23.0-beta.1');

        const result = getVersion(ReleaseType.BETA);

        expect(result).toBe('2.23.0-beta.1');
        expect(getStableBranchVersion).toHaveBeenCalled();
        expect(getNextPreReleaseVersion).toHaveBeenCalledWith(ReleaseType.BETA, '2.23.0');
      });

      test('returns incremented beta version', () => {
        getNextPreReleaseVersion.mockReturnValue('2.22.0-beta.5');

        const result = getVersion(ReleaseType.BETA, '2.22.0');

        expect(result).toBe('2.22.0-beta.5');
      });
    });

    // RC release tests
    describe('release candidate releases', () => {
      test('returns rc version with provided base version', () => {
        getNextPreReleaseVersion.mockReturnValue('2.22.0-rc.1');

        const result = getVersion(ReleaseType.RELEASE_CANDIDATE, '2.22.0');

        expect(result).toBe('2.22.0-rc.1');
        expect(getNextPreReleaseVersion).toHaveBeenCalledWith(ReleaseType.RELEASE_CANDIDATE, '2.22.0');
      });

      test('derives base version from stable branch when not provided', () => {
        getStableBranchVersion.mockReturnValue([2, 24]);
        getNextPreReleaseVersion.mockReturnValue('2.24.0-rc.1');

        const result = getVersion(ReleaseType.RELEASE_CANDIDATE);

        expect(result).toBe('2.24.0-rc.1');
        expect(getStableBranchVersion).toHaveBeenCalled();
        expect(getNextPreReleaseVersion).toHaveBeenCalledWith(ReleaseType.RELEASE_CANDIDATE, '2.24.0');
      });

      test('returns incremented rc version', () => {
        getNextPreReleaseVersion.mockReturnValue('2.22.0-rc.3');

        const result = getVersion(ReleaseType.RELEASE_CANDIDATE, '2.22.0');

        expect(result).toBe('2.22.0-rc.3');
      });
    });

    // Stable release tests
    describe('stable releases', () => {
      test('returns next stable version', () => {
        getNextStableVersion.mockReturnValue([2, 22, 0]);

        const result = getVersion(ReleaseType.STABLE);

        expect(result).toBe('2.22.0');
        expect(getNextStableVersion).toHaveBeenCalled();
      });

      test('returns incremented patch version', () => {
        getNextStableVersion.mockReturnValue([2, 22, 5]);

        const result = getVersion(ReleaseType.STABLE);

        expect(result).toBe('2.22.5');
      });

      test('ignores preReleaseVersion parameter for stable', () => {
        getNextStableVersion.mockReturnValue([2, 22, 0]);

        const result = getVersion(ReleaseType.STABLE, '2.99.0');

        expect(result).toBe('2.22.0');
        expect(getNextStableVersion).toHaveBeenCalled();
      });
    });
  });
});
