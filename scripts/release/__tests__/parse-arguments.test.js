const { parseArguments, ReleaseType } = require('../parse-arguments');

describe('parse-arguments', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    // Reset process.argv before each test
    process.argv = ['node', 'script.js'];
  });

  afterAll(() => {
    process.argv = originalArgv;
  });

  describe('parseArguments', () => {
    // Default behavior (stable release)
    test('returns stable release type with no arguments', () => {
      const result = parseArguments();
      expect(result).toEqual({ releaseType: ReleaseType.STABLE, version: null });
    });

    test('returns stable release type with --version flag', () => {
      process.argv = ['node', 'script.js', '--version', '2.22.0'];
      const result = parseArguments();
      expect(result).toEqual({ releaseType: ReleaseType.STABLE, version: '2.22.0' });
    });

    // Single flag tests
    test('returns commitly release type with --commitly flag', () => {
      process.argv = ['node', 'script.js', '--commitly'];
      const result = parseArguments();
      expect(result).toEqual({ releaseType: ReleaseType.COMMITLY, version: null });
    });

    test('returns beta release type with --beta flag', () => {
      process.argv = ['node', 'script.js', '--beta'];
      const result = parseArguments();
      expect(result).toEqual({ releaseType: ReleaseType.BETA, version: null });
    });

    test('returns rc release type with --rc flag', () => {
      process.argv = ['node', 'script.js', '--rc'];
      const result = parseArguments();
      expect(result).toEqual({ releaseType: ReleaseType.RELEASE_CANDIDATE, version: null });
    });

    // Version with pre-release flags
    test('returns beta with version when both provided', () => {
      process.argv = ['node', 'script.js', '--beta', '--version', '2.22.0'];
      const result = parseArguments();
      expect(result).toEqual({ releaseType: ReleaseType.BETA, version: '2.22.0' });
    });

    test('returns rc with version when both provided', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', '2.22.0'];
      const result = parseArguments();
      expect(result).toEqual({ releaseType: ReleaseType.RELEASE_CANDIDATE, version: '2.22.0' });
    });

    test('handles version flag before release type flag', () => {
      process.argv = ['node', 'script.js', '--version', '2.22.0', '--rc'];
      const result = parseArguments();
      expect(result).toEqual({ releaseType: ReleaseType.RELEASE_CANDIDATE, version: '2.22.0' });
    });

    // Mutual exclusivity tests
    test('throws error when --commitly and --beta are both provided', () => {
      process.argv = ['node', 'script.js', '--commitly', '--beta'];
      expect(() => parseArguments()).toThrow('Release flags --commitly, --beta, and --rc are mutually exclusive');
    });

    test('throws error when --commitly and --rc are both provided', () => {
      process.argv = ['node', 'script.js', '--commitly', '--rc'];
      expect(() => parseArguments()).toThrow('Release flags --commitly, --beta, and --rc are mutually exclusive');
    });

    test('throws error when --beta and --rc are both provided', () => {
      process.argv = ['node', 'script.js', '--beta', '--rc'];
      expect(() => parseArguments()).toThrow('Release flags --commitly, --beta, and --rc are mutually exclusive');
    });

    test('throws error when all three flags are provided', () => {
      process.argv = ['node', 'script.js', '--commitly', '--beta', '--rc'];
      expect(() => parseArguments()).toThrow('Release flags --commitly, --beta, and --rc are mutually exclusive');
    });

    // Version not allowed for commitly
    test('throws error when version provided for commitly release', () => {
      process.argv = ['node', 'script.js', '--commitly', '--version', '2.22.0'];
      expect(() => parseArguments()).toThrow();
    });

    // Version format validation
    test('throws error for invalid version format - missing patch', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', '2.22'];
      expect(() => parseArguments()).toThrow('Provided version "2.22" is not valid. Expected format: x.y.z');
    });

    test('throws error for invalid version format - letters', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', '2.22.a'];
      expect(() => parseArguments()).toThrow('Provided version "2.22.a" is not valid. Expected format: x.y.z');
    });

    test('throws error for invalid version format - extra parts', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', '2.22.0.1'];
      expect(() => parseArguments()).toThrow('Provided version "2.22.0.1" is not valid. Expected format: x.y.z');
    });

    test('throws error for invalid version format - pre-release suffix', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', '2.22.0-rc.1'];
      expect(() => parseArguments()).toThrow('Provided version "2.22.0-rc.1" is not valid. Expected format: x.y.z');
    });

    test('throws error for invalid version format - empty string', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', ''];
      expect(() => parseArguments()).toThrow('Provided version "" is not valid. Expected format: x.y.z');
    });

    // Missing version value
    test('throws error when --version is last argument without value', () => {
      process.argv = ['node', 'script.js', '--rc', '--version'];
      expect(() => parseArguments()).toThrow('Expected a version after --version');
    });

    // Valid version formats
    test('accepts version with single digit numbers', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', '1.2.3'];
      const result = parseArguments();
      expect(result.version).toBe('1.2.3');
    });

    test('accepts version with large numbers', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', '10.100.1000'];
      const result = parseArguments();
      expect(result.version).toBe('10.100.1000');
    });

    test('accepts version with zeros', () => {
      process.argv = ['node', 'script.js', '--rc', '--version', '0.0.0'];
      const result = parseArguments();
      expect(result.version).toBe('0.0.0');
    });
  });

  describe('ReleaseType', () => {
    test('has correct values', () => {
      expect(ReleaseType.STABLE).toBe('stable');
      expect(ReleaseType.BETA).toBe('beta');
      expect(ReleaseType.RELEASE_CANDIDATE).toBe('rc');
      expect(ReleaseType.COMMITLY).toBe('commitly');
    });
  });
});
