const { exit } = require('process');
const path = require('path');

const basicExamplePackageJsonPath = path.join(
  __dirname,
  '../apps/basic-example/package.json'
);
const basicExamplePackageJson = require(basicExamplePackageJsonPath);

const rnghPackageJsonPath = path.join(
  __dirname,
  '../packages/react-native-gesture-handler/package.json'
);
const rnghPackageJson = require(rnghPackageJsonPath);

const rootPackageJsonPath = path.join(__dirname, '../package.json');
const rootPackageJson = require(rootPackageJsonPath);

const versions = new Set([
  rnghPackageJson.devDependencies['react-native'],
  basicExamplePackageJson.dependencies['react-native'],
  rootPackageJson.devDependencies['react-native'],
]);

if (versions.size !== 1) {
  console.error(
    'There is a mismatch between the react-native version in the BasicExample, react-native-gesture-handler, and root packages.\nIf you are bumping react-native version, make sure to also update react-native-gesture-handler and root package.json.'
  );
  exit(1);
}
