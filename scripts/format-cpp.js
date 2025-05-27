const { exit } = require('process');
const { exec } = require('child_process');
const path = require('path');
const glob = require('glob');

function runFormatter(files) {
  const command = `yarn clang-format -i ${files}`;

  exec(command, (error, stdout) => {
    if (error) {
      console.log(error);
      console.log(stdout);
      return exit(1);
    }
  });
}

const argc = process.argv.length;

if (argc > 2) {
  const files = process.argv.slice(2).join(' ');
  runFormatter(files);
} else {
  const pattern = path.join(
    __dirname,
    '../packages/react-native-gesture-handler/{shared,android/src}/**/*.{h,cpp}'
  );

  glob(pattern, (err, filesArray) => {
    if (err) {
      console.error('Error finding files:', err);
      return exit(1);
    }

    const files = filesArray.join(' ');
    runFormatter(files);
  });
}
