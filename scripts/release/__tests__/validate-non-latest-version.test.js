jest.mock('../npm-utils', () => ({
  getPackageVersionByTag: jest.fn(),
}));

const { getPackageVersionByTag } = require('../npm-utils');
const { validateNonLatestVersion } = require('../validate-non-latest-version');

describe('validate-non-latest-version', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateNonLatestVersion', () => {
    // Valid cases - version doesn't exist
    test('returns true when stable version does not exist', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });

      const result = validateNonLatestVersion('2.30.0');

      expect(result).toBe(true);
      expect(getPackageVersionByTag).toHaveBeenCalledWith('react-native-gesture-handler', '2.30.0');
    });

    test('returns true when base version of rc does not exist', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });

      const result = validateNonLatestVersion('2.30.0-rc.1');

      expect(result).toBe(true);
      expect(getPackageVersionByTag).toHaveBeenCalledWith('react-native-gesture-handler', '2.30.0');
    });

    test('returns true when base version of beta does not exist', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });

      const result = validateNonLatestVersion('2.30.0-beta.1');

      expect(result).toBe(true);
      expect(getPackageVersionByTag).toHaveBeenCalledWith('react-native-gesture-handler', '2.30.0');
    });

    test('returns true when base version of nightly does not exist', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });

      const result = validateNonLatestVersion('2.30.0-nightly-20260129-abc123def');

      expect(result).toBe(true);
      expect(getPackageVersionByTag).toHaveBeenCalledWith('react-native-gesture-handler', '2.30.0');
    });

    // Invalid cases - version already exists
    test('throws error when stable version already exists', () => {
      getPackageVersionByTag.mockReturnValue('2.30.0');

      expect(() => validateNonLatestVersion('2.30.0')).toThrow(
        'Version 2.30.0 already exists in the npm registry'
      );
    });

    test('throws error when base version of rc already exists', () => {
      getPackageVersionByTag.mockReturnValue('2.30.0');

      expect(() => validateNonLatestVersion('2.30.0-rc.1')).toThrow(
        'Version 2.30.0 already exists in the npm registry'
      );
    });

    test('throws error when base version of beta already exists', () => {
      getPackageVersionByTag.mockReturnValue('2.30.0');

      expect(() => validateNonLatestVersion('2.30.0-beta.5')).toThrow(
        'Version 2.30.0 already exists in the npm registry'
      );
    });

    test('throws error when base version of nightly already exists', () => {
      getPackageVersionByTag.mockReturnValue('2.30.0');

      expect(() => validateNonLatestVersion('2.30.0-nightly-20260129-abc123def')).toThrow(
        'Version 2.30.0 already exists in the npm registry'
      );
    });

    // Edge cases
    test('checks correct base version for different patch numbers', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });

      validateNonLatestVersion('2.30.5-rc.1');

      expect(getPackageVersionByTag).toHaveBeenCalledWith('react-native-gesture-handler', '2.30.5');
    });

    test('checks correct base version for different minor numbers', () => {
      getPackageVersionByTag.mockImplementation(() => {
        throw new Error('Not found');
      });

      validateNonLatestVersion('2.45.0-beta.2');

      expect(getPackageVersionByTag).toHaveBeenCalledWith('react-native-gesture-handler', '2.45.0');
    });
  });
});
