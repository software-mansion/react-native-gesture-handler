const fs = require('fs');
const { parseArguments } = require('./parse-arguments');
const { getVersion } = require('./get-version');

const PACKAGE_PATH = './packages/react-native-gesture-handler/package.json';

function setPackageVersion() {
  const { releaseType, version: preReleaseVersion } = parseArguments();

  const version = getVersion(releaseType, preReleaseVersion);
  
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  packageJson.version = version;
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2));

  // Intentional, this is consumed by the action
  console.log(version);
}

if (require.main === module) {
  setPackageVersion();
}
