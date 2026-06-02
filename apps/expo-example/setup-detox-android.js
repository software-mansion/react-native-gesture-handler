#!/usr/bin/env node
/**
 * Patches the Android project after `expo prebuild` to add Detox e2e test support.
 */

// eslint-disable-next-line import-x/no-commonjs, @typescript-eslint/no-var-requires
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
// eslint-disable-next-line import-x/no-commonjs, @typescript-eslint/no-var-requires
const { join } = require('path');

const androidDir = join(__dirname, 'android');

// Derive android package from build.gradle written by expo prebuild.
// This avoids hardcoding the package and keeps things in sync with app.config.*.
const appBuildGradleContent = readFileSync(
  join(androidDir, 'app', 'build.gradle'),
  'utf8'
);
const packageMatch = appBuildGradleContent.match(/applicationId\s+['"]([^'"]+)['"]/);
if (!packageMatch) {
  console.error(
    'ERROR: Could not determine android package from android/app/build.gradle.\n' +
      'Make sure you have run `expo prebuild` before running this script.'
  );
  process.exit(1);
}
const androidPackage = packageMatch[1]; // e.g. "com.example.ExpoExample"
const packagePath = androidPackage.replace(/\./g, '/'); // e.g. "com/example/ExpoExample"

// Validate that the main source package directory exists (sanity check after prebuild).
const mainPackageDir = join(
  androidDir,
  'app',
  'src',
  'main',
  'java',
  packagePath
);
if (!existsSync(mainPackageDir)) {
  console.error(
    `ERROR: Expected package directory does not exist: ${mainPackageDir}\n` +
      'Make sure you have run `expo prebuild` before running this script.'
  );
  process.exit(1);
}

console.log(`Detected android package: ${androidPackage}`);

function patchFile(filePath, patches) {
  let content = readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { find, replace, description } of patches) {
    if (content.includes(replace)) {
      console.log(`  already applied: ${description}`);
      continue;
    }
    if (!content.includes(find)) {
      console.error(`  ERROR: Could not find anchor for: ${description}`);
      process.exit(1);
    }
    content = content.replace(find, replace);
    changed = true;
    console.log(`  applied: ${description}`);
  }

  if (changed) {
    writeFileSync(filePath, content, 'utf8');
  }
}

// 1. android/build.gradle
console.log('\n[1/5] Patching android/build.gradle...');
patchFile(join(androidDir, 'build.gradle'), [
  {
    description: 'Detox maven repo',
    find: `    maven { url 'https://www.jitpack.io' }`,
    replace: `    maven { url 'https://www.jitpack.io' }
    maven { url("$rootDir/../node_modules/detox/Detox-android") }`,
  },
]);

// 2. android/app/build.gradle
console.log('\n[2/5] Patching android/app/build.gradle...');
const appBuildGradlePath = join(androidDir, 'app', 'build.gradle');
let appBuildGradle = readFileSync(appBuildGradlePath, 'utf8');

const patches = [
  {
    description: 'testBuildType + testInstrumentationRunner in defaultConfig',
    find: `        buildConfigField "String", "REACT_NATIVE_RELEASE_LEVEL"`,
    replace: `        testBuildType System.getProperty('testBuildType', 'debug')
        testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'
        buildConfigField "String", "REACT_NATIVE_RELEASE_LEVEL"`,
  },
  {
    description: 'Detox ProGuard rules for release',
    find: `            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"`,
    replace: `            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            proguardFile "\${rootProject.projectDir}/../node_modules/detox/android/detox/proguard-rules-app.pro"`,
  },
  {
    description: 'androidTestImplementation for Detox',
    find: `    if (hermesEnabled.toBoolean()) {`,
    replace: `    androidTestImplementation('com.wix:detox:+')

    if (hermesEnabled.toBoolean()) {`,
  },
];

let changed = false;
for (const { find, replace, description } of patches) {
  if (appBuildGradle.includes(replace)) {
    console.log(`  already applied: ${description}`);
    continue;
  }
  if (!appBuildGradle.includes(find)) {
    console.error(`  ERROR: Could not find anchor for: ${description}`);
    process.exit(1);
  }
  appBuildGradle = appBuildGradle.replace(find, replace);
  changed = true;
  console.log(`  applied: ${description}`);
}
if (changed) {
  writeFileSync(appBuildGradlePath, appBuildGradle, 'utf8');
}

// 3. DetoxTest.kt
console.log('\n[3/5] Creating DetoxTest.kt...');
const detoxTestDir = join(
  androidDir,
  'app',
  'src',
  'androidTest',
  'java',
  packagePath
);
const detoxTestPath = join(detoxTestDir, 'DetoxTest.kt');
if (existsSync(detoxTestPath)) {
  console.log('  already exists: DetoxTest.kt');
} else {
  mkdirSync(detoxTestDir, { recursive: true });
  writeFileSync(
    detoxTestPath,
    [
      `package ${androidPackage}`,
      '',
      'import androidx.test.ext.junit.runners.AndroidJUnit4',
      'import androidx.test.filters.LargeTest',
      'import androidx.test.rule.ActivityTestRule',
      'import com.wix.detox.Detox',
      'import com.wix.detox.config.DetoxConfig',
      'import org.junit.Rule',
      'import org.junit.Test',
      'import org.junit.runner.RunWith',
      '',
      '@RunWith(AndroidJUnit4::class)',
      '@LargeTest',
      'class DetoxTest {',
      '    @JvmField',
      '    @Rule',
      '    var mActivityRule: ActivityTestRule<MainActivity> = ActivityTestRule(MainActivity::class.java, false, false)',
      '',
      '    @Test',
      '    fun runDetoxTests() {',
      '        val detoxConfig = DetoxConfig()',
      '        detoxConfig.idlePolicyConfig.masterTimeoutSec = 90',
      '        detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 60',
      '        detoxConfig.rnContextLoadTimeoutSec = if (BuildConfig.DEBUG) 180 else 60',
      '        Detox.runTests(mActivityRule, detoxConfig)',
      '    }',
      '}',
      '',
    ].join('\n')
  );
  console.log('  created: DetoxTest.kt');
}

// 4. network_security_config.xml
console.log('\n[4/5] Creating network_security_config.xml...');
const xmlDir = join(androidDir, 'app', 'src', 'main', 'res', 'xml');
const xmlPath = join(xmlDir, 'network_security_config.xml');
if (existsSync(xmlPath)) {
  console.log('  already exists: network_security_config.xml');
} else {
  mkdirSync(xmlDir, { recursive: true });
  writeFileSync(
    xmlPath,
    [
      '<?xml version="1.0" encoding="utf-8"?>',
      '<network-security-config>',
      '    <domain-config cleartextTrafficPermitted="true">',
      '        <domain includeSubdomains="true">10.0.2.2</domain>',
      '        <domain includeSubdomains="true">localhost</domain>',
      '    </domain-config>',
      '</network-security-config>',
      '',
    ].join('\n')
  );
  console.log('  created: network_security_config.xml');
}

// 5. AndroidManifest.xml
console.log('\n[5/5] Patching AndroidManifest.xml...');
patchFile(join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml'), [
  {
    description: 'networkSecurityConfig on <application>',
    find: '<application android:name=".MainApplication"',
    replace:
      '<application android:name=".MainApplication" android:networkSecurityConfig="@xml/network_security_config"',
  },
]);

console.log('\nDetox Android setup complete!\n');
