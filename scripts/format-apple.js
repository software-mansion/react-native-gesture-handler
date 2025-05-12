const { exit } = require('process');
const path = require('path');
const { exec, spawn } = require('child_process');

function runFormatter(files) {
  const command = `yarn clang-format -i ${files}`;

  console.log(`Running command: ${command}`);

  exec(command, (error, stdout) => {
    if (error) {
      console.log(error);
      console.log(stdout);
      return exit(1);
    }
  });
}

// takes file as parameter passed by lint-staged (optional)
let files = process.argv[2];

if (!files) {
  const find = spawn('find', [
    path.join(__dirname, '../packages/react-native-gesture-handler/apple'),
    '-iname',
    '*.h',
    '-o',
    '-iname',
    '*.m',
    '-o',
    '-iname',
    '*.mm',
    '-o',
    '-iname',
    '*.cpp',
  ]);

  find.stdout.on('data', (data) => {
    files = data.toString().trim().replace(/\n/g, ' ');

    runFormatter(files);
  });
} else {
  runFormatter(files);
}
