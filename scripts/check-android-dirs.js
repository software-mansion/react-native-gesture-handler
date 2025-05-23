const { exit } = require('process');
const path = require('path');

const packageJsonPath = path.join(
  __dirname,
  '../packages/react-native-gesture-handler/package.json'
);

const packageJson = require(packageJsonPath);
const packageFiles = packageJson.files.filter((dir) =>
  dir.startsWith('android')
);

const subdirRegex = /android\/[a-zA-Z0-9]*/;
const argc = process.argv.length;

for (let i = 2; i < argc; ++i) {
  const filePath = process.argv[i];

  const subdir = filePath.match(subdirRegex)[0];

  if (!packageFiles.some((file) => file.startsWith(subdir))) {
    console.error(
      `Subdirectory ${subdir} is not included in package.json files`
    );

    exit(1);
  }
}
