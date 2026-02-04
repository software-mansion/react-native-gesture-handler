jest.mock('../npm-utils', () => ({
  getPackageVersionByTag: jest.fn(),
}));

const { getPackageVersionByTag } = require('../npm-utils');
const { shouldBeLatest } = require('../should-be-latest');

describe('should-be-latest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldBeLatest', () => {
    // Pre-release tests - should always return false
    test('returns false for pre-release versions (rc)', () => {
      const result = shouldBeLatest('2.22.0-rc.1');
      expect(result).toBe(false);
    });

    test('returns false for pre-release versions (beta)', () => {
      const result = shouldBeLatest('2.22.0-beta.1');
      expect(result).toBe(false);
    });

    test('returns false for nightly versions', () => {
      const result = shouldBeLatest('2.23.0-nightly-20260129-abc123def');
      expect(result).toBe(false);
    });

    // Patch version tests
    test('returns true for next patch version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('2.22.1');
      expect(result).toBe(true);
    });

    test('returns true for skipped patch version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('2.22.2');
      expect(result).toBe(true);
    });

    test('returns false for same patch version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('2.22.0');
      expect(result).toBe(false);
    });

    test('returns false for previous patch version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.5');
      const result = shouldBeLatest('2.22.4');
      expect(result).toBe(false);
    });

    // Minor version tests
    test('returns true for next minor version with patch 0', () => {
      getPackageVersionByTag.mockReturnValue('2.22.5');
      const result = shouldBeLatest('2.23.0');
      expect(result).toBe(true);
    });

    test('returns true for next minor with non-zero patch', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('2.23.1');
      expect(result).toBe(true);
    });

    test('returns true for skipped minor version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('2.24.0');
      expect(result).toBe(true);
    });

    test('returns false for previous minor version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('2.21.0');
      expect(result).toBe(false);
    });

    test('returns false for same minor with lower patch', () => {
      getPackageVersionByTag.mockReturnValue('2.22.5');
      const result = shouldBeLatest('2.22.3');
      expect(result).toBe(false);
    });

    // Major version tests
    test('returns true for next major version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('3.0.0');
      expect(result).toBe(true);
    });

    test('returns true for skipped major version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('4.0.0');
      expect(result).toBe(true);
    });

    test('returns false for previous major version', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('1.0.0');
      expect(result).toBe(false);
    });

    test('returns false for same major with lower minor', () => {
      getPackageVersionByTag.mockReturnValue('2.22.0');
      const result = shouldBeLatest('2.20.5');
      expect(result).toBe(false);
    });
  });
});
