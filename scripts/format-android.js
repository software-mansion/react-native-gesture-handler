/*
 * This script is a wrapper for gradle & spotlessApply to make
 * it work properly with lint-staged.
 */

const { exit } = require('process');
const { exec } = require('child_process');
const path = require('path');

const androidPath = path.join(
  __dirname,
  '../packages/react-native-gesture-handler/android'
);

const spotlessApply = `${androidPath}/gradlew -p ${androidPath} spotlessApply`;

exec(spotlessApply, (error, stdout) => {
  if (error) {
    console.log(error);
    console.log(stdout);
    return exit(1);
  }
});
