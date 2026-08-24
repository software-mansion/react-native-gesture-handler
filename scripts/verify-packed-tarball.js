// Leak gate + completeness check for a packed react-native-gesture-handler
// tarball (split plan bridge): no @swmansion/gesture-handler-* specifier may
// survive into the artifact, the native aux surface must be present, and when
// internal workspace packages exist their sources must be vendored in.
//
//   node scripts/verify-packed-tarball.js <tarball.tgz>
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const SCOPE_PREFIX = '@swmansion/gesture-handler-';

const tarball = process.argv[2];
if (!tarball || !fs.existsSync(tarball)) {
  console.error('usage: node scripts/verify-packed-tarball.js <tarball.tgz>');
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rngh-pack-check-'));
execSync(
  `tar -xzf ${JSON.stringify(path.resolve(tarball))} -C ${JSON.stringify(tmp)}`
);
const root = path.join(tmp, 'package');

const failures = [];

// 1. Completeness sentinels — one representative per shipped surface.
const SENTINELS = [
  'package.json',
  'README.md',
  'src/index.ts',
  'lib/module/index.js',
  'lib/typescript/index.d.ts',
  'android/build.gradle',
  'apple/RNGestureHandler.h',
  'shared/runtime/RNGHRuntimeDecorator.cpp',
  'scripts/gesture_handler_utils.rb',
  'RNGestureHandler.podspec',
  'react-native.config.js',
  'jestSetup.js',
  'jest-utils/package.json',
];

for (const sentinel of SENTINELS) {
  if (!fs.existsSync(path.join(root, sentinel))) {
    failures.push(`missing from tarball: ${sentinel}`);
  }
}

// 1b. lib/ must hold exactly the configured bob targets — a stale local
// lib/commonjs would silently reship the CJS build removed in #4069.
// (Part 4 re-adds a commonjs target deliberately; update this list then.)
const LIB_TARGETS = ['module', 'typescript'];
if (fs.existsSync(path.join(root, 'lib'))) {
  for (const dir of fs.readdirSync(path.join(root, 'lib'))) {
    if (!LIB_TARGETS.includes(dir)) {
      failures.push(`unexpected build target in tarball: lib/${dir}`);
    }
  }
}

// 2. Vendoring: every internal workspace package must ship inside src/vendor.
const internal = [];
for (const dir of fs.readdirSync(path.join(repoRoot, 'packages'))) {
  const file = path.join(repoRoot, 'packages', dir, 'package.json');
  if (!fs.existsSync(file)) {
    continue;
  }
  const name = JSON.parse(fs.readFileSync(file, 'utf8')).name;
  if (name?.startsWith(SCOPE_PREFIX)) {
    internal.push(name);
  }
}
const productManifest = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, 'packages/react-native-gesture-handler/package.json'),
    'utf8'
  )
);
for (const name of internal) {
  if (!(name in (productManifest.dependencies ?? {}))) {
    continue;
  }
  const vendored = path.join(
    root,
    'src/vendor',
    name.slice(SCOPE_PREFIX.length)
  );
  if (!fs.existsSync(vendored)) {
    failures.push(`internal dependency ${name} not vendored at src/vendor/`);
  }
}

// 3. Leak gate over every file in the artifact (manifest included).
let files = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
    } else {
      files++;
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes(SCOPE_PREFIX)) {
        failures.push(
          `leaked ${SCOPE_PREFIX}* specifier in ${path.relative(root, p)}`
        );
      }
      if (
        p.endsWith(`${path.sep}package.json`) &&
        content.includes('workspace:')
      ) {
        failures.push(`workspace: protocol in ${path.relative(root, p)}`);
      }
    }
  }
}
walk(root);

fs.rmSync(tmp, { recursive: true, force: true });

if (failures.length) {
  console.error(`verify-packed-tarball: FAIL (${failures.length} problems)`);
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}
console.log(
  `verify-packed-tarball: OK — ${files} files, ${internal.length} internal packages known, 0 leaks`
);
