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
  const globPattern = process.env.FORMAT_GLOB_PATTERN
  if (!globPattern) {
    console.error('FORMAT_GLOB_PATTERN environment variable is not set.');
    return exit(1);
  }

  const pattern = path.join(__dirname, globPattern);

  glob(pattern, (err, filesArray) => {
    if (err) {
      console.error('Error finding files:', err);
      return exit(1);
    }

    const files = filesArray.join(' ');
    runFormatter(files);
  });
}
