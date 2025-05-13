/*
 * This script is a wrapper for gradle & spotlessApply to make
 * it work properly with lint-staged.
 */

const { exit } = require('process');
const { exec } = require('child_process');

const log_error = (error, stdout) => {
  if (error) {
    console.log(error);
    console.log(stdout);
    return exit(1);
  }
};

// spotless ktlint formatting task in android/build.gradle
const spotlessApply = './android/gradlew -p android spotlessApply';

const argc = process.argv.length;

if (argc >= 2) {
  for (let i = 2; i < argc; ++i) {
    const fileArgument = `-PspotlessIdeHook=${process.argv[i]}`;
    const command = `${spotlessApply} ${fileArgument}`;

    exec(command, log_error);
  }
} else {
  exec(spotlessApply, log_error);
}
