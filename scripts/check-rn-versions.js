const { exit } = require('process');
const path = require('path');

const basicExamplePackageJsonPath = path.join(
  __dirname,
  '../apps/BasicExample/package.json'
);
const basicExamplePackageJson = require(basicExamplePackageJsonPath);

const rnghPackageJsonPath = path.join(
  __dirname,
  '../packages/react-native-gesture-handler/package.json'
);
const rnghPackageJson = require(rnghPackageJsonPath);

if (
  rnghPackageJson.devDependencies['react-native'] !==
  basicExamplePackageJson.dependencies['react-native']
) {
  console.error(
    'There is a mismatch between the react-native version in the BasicExample and react-native-gesture-handler packages.\nIf you are bumping react-native version, make sure to also update react-native-gesture-handler package.json.'
  );
  exit(1);
}
