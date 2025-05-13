const { exit } = require('process');
const { exec, spawn } = require('child_process');
const path = require('path');

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

if (argc >= 2) {
  const files = process.argv.slice(2).join(' ');
  runFormatter(files);
} else {
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
}
