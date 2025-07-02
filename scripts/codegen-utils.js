const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const packageJSON = require('../packages/react-native-gesture-handler/package.json');

const ERROR_PREFIX = 'react-native-gesture-handler';
const ROOT_DIR = path.resolve(
  __dirname,
  '../packages/react-native-gesture-handler'
);
const ANDROID_DIR = path.resolve(ROOT_DIR, 'android');
const GENERATED_DIR = path.resolve(ANDROID_DIR, 'build/generated');
const OLD_ARCH_DIR = path.resolve(ANDROID_DIR, 'paper/src/main');
const SPECS_DIR = path.resolve(ROOT_DIR, packageJSON.codegenConfig.jsSrcsDir);
const PACKAGE_NAME = packageJSON.codegenConfig.android.javaPackageName;
const RN_DIR = path.resolve(__dirname, '../node_modules/react-native');
const RN_CODEGEN_DIR = path.resolve(
  __dirname,
  '../node_modules/@react-native/codegen'
);

const SOURCE_FOLDER = 'java/com/facebook/react/viewmanagers';
const GH_SOURCE_FOLDER = 'java/com/swmansion/gesturehandler';

const SOURCE_FOLDERS = [
  {
    codegenPath: `${GENERATED_DIR}/source/codegen/${SOURCE_FOLDER}`,
    oldArchPath: `${OLD_ARCH_DIR}/${SOURCE_FOLDER}`,
  },
  {
    codegenPath: `${GENERATED_DIR}/source/codegen/${GH_SOURCE_FOLDER}`,
    oldArchPath: `${OLD_ARCH_DIR}/${GH_SOURCE_FOLDER}`,
  },
];

const BLACKLISTED_FILES = new Set(['ReactContextExtensions.kt']);

function exec(command) {
  console.log(`[${ERROR_PREFIX}]> ` + command);
  execSync(command);
}

function readdirSync(dir) {
  return fs.readdirSync(dir).filter((file) => !BLACKLISTED_FILES.has(file));
}

function fixOldArchJavaForRN72Compat(dir) {
  // see https://github.com/rnmapbox/maps/issues/3193
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const fileExtension = path.extname(file);
    if (fileExtension === '.java') {
      let fileContent = fs.readFileSync(filePath, 'utf-8');
      let newFileContent = fileContent.replace(
        /extends ReactContextBaseJavaModule implements TurboModule/g,
        'extends ReactContextBaseJavaModule implements ReactModuleWithSpec, TurboModule'
      );
      if (fileContent !== newFileContent) {
        // also insert an import line with `import com.facebook.react.bridge.ReactModuleWithSpec;`
        newFileContent = newFileContent.replace(
          /import com.facebook.react.bridge.ReactMethod;/,
          'import com.facebook.react.bridge.ReactMethod;\nimport com.facebook.react.bridge.ReactModuleWithSpec;'
        );

        console.log(' => fixOldArchJava applied to:', filePath);
        fs.writeFileSync(filePath, newFileContent, 'utf-8');
      }
    } else if (fs.lstatSync(filePath).isDirectory()) {
      fixOldArchJavaForRN72Compat(filePath);
    }
  });
}

async function generateCodegen() {
  exec(`rm -rf ${GENERATED_DIR}`);
  exec(`mkdir -p ${GENERATED_DIR}/source/codegen/`);

  exec(
    `node ${RN_CODEGEN_DIR}/lib/cli/combine/combine-js-to-schema-cli.js --platform android ${GENERATED_DIR}/source/codegen/schema.json ${SPECS_DIR}`
  );
  exec(
    `node ${RN_DIR}/scripts/generate-specs-cli.js --platform android --schemaPath ${GENERATED_DIR}/source/codegen/schema.json --outputDir ${GENERATED_DIR}/source/codegen --javaPackageName ${PACKAGE_NAME}`
  );

  fixOldArchJavaForRN72Compat(`${GENERATED_DIR}/source/codegen/java/`);
}

async function generateCodegenJavaOldArch() {
  await generateCodegen();

  SOURCE_FOLDERS.forEach(({ codegenPath, oldArchPath }) => {
    const generatedFiles = readdirSync(codegenPath);
    const oldArchFiles = readdirSync(oldArchPath);
    const existingFilesSet = new Set(oldArchFiles.map((fileName) => fileName));

    generatedFiles.forEach((generatedFile) => {
      if (!existingFilesSet.has(generatedFile)) {
        console.warn(
          `[${ERROR_PREFIX}] ${generatedFile} not found in paper dir, if it's used on Android you need to copy it manually and implement yourself before using auto-copy feature.`
        );
      }
    });

    if (oldArchFiles.length === 0) {
      console.warn(
        `[${ERROR_PREFIX}] Paper destination with codegen interfaces is empty. This might be okay if you don't have any interfaces/delegates used on Android, otherwise please check if OLD_ARCH_DIR and SOURCE_FOLDERS are set properly.`
      );
    }

    oldArchFiles.forEach((file) => {
      if (!fs.existsSync(`${codegenPath}/${file}`)) {
        console.warn(
          `[${ERROR_PREFIX}] ${file} file does not exist in codegen artifacts source destination. Please check if you still need this interface/delagete.`
        );
      } else {
        const filesTheSame = compareFileAtTwoPaths(file, codegenPath, oldArchPath);
        exec(`cp -rf ${codegenPath}/${file} ${oldArchPath}/${file}`);

        if (!filesTheSame) {
          exec(`git add ${oldArchPath}/${file}`);
        }
      }
    });
  });
}

function compareFileAtTwoPaths(filename, firstPath, secondPath) {
  const fileA = fs.readFileSync(`${firstPath}/${filename}`, 'utf-8');
  const fileB = fs.readFileSync(`${secondPath}/${filename}`, 'utf-8');

  return fileA === fileB
}

async function checkCodegenIntegrity() {
  await generateCodegen();

  SOURCE_FOLDERS.forEach(({ codegenPath, oldArchPath }) => {
    const oldArchFiles = readdirSync(oldArchPath);
    oldArchFiles.forEach((file) => {
      if (!compareFileAtTwoPaths(file, codegenPath, oldArchPath)) {
        throw new Error(
          `[${ERROR_PREFIX}] File ${file} is different at ${codegenPath} and ${oldArchPath}. Make sure you committed codegen autogenerated files.`
        );
      }
    });
  });
}

module.exports = { generateCodegenJavaOldArch, checkCodegenIntegrity };
