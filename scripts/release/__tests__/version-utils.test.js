const { parseVersion } = require('../version-utils');

jest.mock('../npm-utils', () => ({
  getPackageVersionByTag: jest.fn(),
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

const { getPackageVersionByTag } = require('../npm-utils');
const { execSync } = require('child_process');
const { getStableBranchVersion, getLatestVersion, getNextStableVersion, getNextPreReleaseVersion } = require('../version-utils');

describe('version-utils', () => {
  describe('parseVersion', () => {
    test('parses stable version correctly', () => {
      const result = parseVersion('2.22.0');
      expect(result).toEqual([2, 22, 0, null]);
    });

    test('parses version with single digits', () => {
      const result = parseVersion('1.2.3');
      expect(result).toEqual([1, 2, 3, null]);
    });

    test('parses version with large numbers', () => {
      const result = parseVersion('10.100.1000');
      expect(result).toEqual([10, 100, 1000, null]);
    });

    test('parses rc pre-release version', () => {
      const result = parseVersion('2.22.0-rc.1');
      expect(result).toEqual([2, 22, 0, '-rc.1']);
    });

    test('parses beta pre-release version', () => {
      const result = parseVersion('2.22.0-beta.5');
      expect(result).toEqual([2, 22, 0, '-beta.5']);
    });

    test('parses nightly pre-release version', () => {
      const result = parseVersion('2.23.0-nightly-20260129-abc123def');
      expect(result).toEqual([2, 23, 0, '-nightly-20260129-abc123def']);
    });

    test('throws error for invalid version format', () => {
      expect(() => parseVersion('invalid')).toThrow('Invalid version string: invalid');
    });

    test('throws error for version missing patch', () => {
      expect(() => parseVersion('2.22')).toThrow('Invalid version string: 2.22');
    });

    test('throws error for version with extra parts', () => {
      expect(() => parseVersion('2.22.0.1')).toThrow('Invalid version string: 2.22.0.1');
    });

    test('throws error for empty string', () => {
      expect(() => parseVersion('')).toThrow('Invalid version string: ');
    });

    test('throws error for version with letters', () => {
      expect(() => parseVersion('2.22.a')).toThrow('Invalid version string: 2.22.a');
    });
  });

  describe('getStableBranchVersion', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('parses stable branch version correctly', () => {
      execSync.mockReturnValue(Buffer.from('2.22-stable\n'));
      const result = getStableBranchVersion();
      expect(result).toEqual([2, 22]);
    });

    test('parses another stable branch version', () => {
      execSync.mockReturnValue(Buffer.from('3.0-stable\n'));
      const result = getStableBranchVersion();
      expect(result).toEqual([3, 0]);
    });

    test('throws error for non-stable branch', () => {
      execSync.mockReturnValue(Buffer.from('main\n'));
      expect(() => getStableBranchVersion()).toThrow('Failed to parse stable version from branch: main');
    });
  });

  describe('getLatestVersion', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('returns parsed latest version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = getLatestVersion();
      expect(result).toEqual([2, 22, 0, null]);
      expect(getPackageVersionByTag).toHaveBeenCalledWith('react-native-gesture-handler', 'latest');
    });

    test('returns parsed latest version with higher numbers', () => {
      getPackageVersionByTag.mockReturnValue('2.25.3');
      const result = getLatestVersion();
      expect(result).toEqual([2, 25, 3, null]);
    });

    test('throws error for invalid latest version', () => {
      getPackageVersionByTag.mockReturnValue('invalid');
      expect(() => getLatestVersion()).toThrow('Failed to parse latest version: invalid');
    });
  });

  describe('getNextStableVersion', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('returns first patch version when none published', () => {
      execSync.mockReturnValue(Buffer.from('2.23-stable\n'));
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });
      const result = getNextStableVersion();
      expect(result).toEqual([2, 23, 0]);
    });

    test('returns next patch version when some already published', () => {
      execSync.mockReturnValue(Buffer.from('2.22-stable\n'));
      getPackageVersionByTag
        .mockReturnValueOnce('2.22.0') // 2.22.0 exists
        .mockReturnValueOnce('2.22.1') // 2.22.1 exists
        .mockReturnValueOnce('2.22.2') // 2.22.2 exists
        .mockImplementationOnce(() => { throw new Error('Not found'); }); // 2.22.3 doesn't exist
      const result = getNextStableVersion();
      expect(result).toEqual([2, 22, 3]);
    });
  });

  describe('getNextPreReleaseVersion', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('returns first rc version when none published', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });
      const result = getNextPreReleaseVersion('rc', '2.22.0');
      expect(result).toBe('2.22.0-rc.1');
    });

    test('returns first beta version when none published', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });
      const result = getNextPreReleaseVersion('beta', '2.22.0');
      expect(result).toBe('2.22.0-beta.1');
    });

    test('returns next rc version when some already published', () => {
      getPackageVersionByTag
        .mockReturnValueOnce('2.22.0-rc.1') // rc.1 exists
        .mockReturnValueOnce('2.22.0-rc.2') // rc.2 exists
        .mockImplementationOnce(() => { throw new Error('Not found'); }); // rc.3 doesn't exist
      const result = getNextPreReleaseVersion('rc', '2.22.0');
      expect(result).toBe('2.22.0-rc.3');
    });

    test('returns next beta version when some already published', () => {
      getPackageVersionByTag
        .mockReturnValueOnce('2.22.0-beta.1') // beta.1 exists
        .mockImplementationOnce(() => { throw new Error('Not found'); }); // beta.2 doesn't exist
      const result = getNextPreReleaseVersion('beta', '2.22.0');
      expect(result).toBe('2.22.0-beta.2');
    });

    test('works with different base versions', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });
      const result = getNextPreReleaseVersion('rc', '2.23.0');
      expect(result).toBe('2.23.0-rc.1');
    });
  });
});
