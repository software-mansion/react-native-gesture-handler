/* 
 * This script is a wrapper for gradle & spotlessApply to make
 * it work properly with lint-staged.
 */

const { exit } = require("process");
const { exec } = require("child_process");

// spotless ktlint formatting task in android/build.gradle
const spotlessApply = "./android/gradlew -p android spotlessApply";

// takes file as parameter passed by lint-staged (optional)
const fileName = process.argv[2];

// https://github.com/diffplug/spotless/blob/main/plugin-gradle/IDE_HOOK.md
// creates file argument without space between arguments
const fileArgument = `-PspotlessIdeHook=${fileName}`;

const command = fileName !== undefined ? `${spotlessApply} ${fileArgument}` : spotlessApply;

exec(command, (error, stdout) => {
  if (error) {
    console.log(error);
    console.log(stdout);
    return exit(1);
  }
});
