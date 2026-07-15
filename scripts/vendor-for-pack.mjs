// PoC for 2-package publishing (strategy v3 §14): produce a self-contained
// packed layout for a product package by vendoring the private core + engine
// workspace packages into it and rewriting their specifiers to relative paths.
//
//   node scripts/vendor-for-pack.mjs packages/react-native-gesture-handler
//   node scripts/vendor-for-pack.mjs packages/react-gesture-handler
//
// Output: <product>/dist-pack/ — the staging layout `npm pack` runs FROM
// (the real prepack additionally builds lib/ and, for native, includes the
// android/apple/codegen dirs unchanged; this PoC proves the source-level
// self-containment that the Metro raw-TS consumption path requires).
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const CORE = path.join(repoRoot, 'packages/gesture-handler-core/src');
const ENGINE = path.join(repoRoot, 'packages/gesture-handler-dom-engine/src');

const productArg = process.argv[2];
if (!productArg) {
  console.error(
    'usage: node scripts/vendor-for-pack.mjs <product package dir>'
  );
  process.exit(1);
}
const product = path.resolve(repoRoot, productArg);
const out = path.join(product, 'dist-pack');
const outSrc = path.join(out, 'src');
const isNative = product.endsWith('react-native-gesture-handler');

fs.rmSync(out, { recursive: true, force: true });

function copyTree(from, to, filter = () => true) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (!filter(src, entry)) {
      continue;
    }
    if (entry.isDirectory()) {
      copyTree(src, dst, filter);
    } else {
      fs.copyFileSync(src, dst);
    }
  }
}

// 1. product sources (tests are not part of the published tarball)
copyTree(path.join(product, 'src'), outSrc, (p) => !p.includes('__tests__'));

// 2. vendored internals
copyTree(CORE, path.join(outSrc, 'vendor/core'));
copyTree(ENGINE, path.join(outSrc, 'vendor/dom-engine'));
if (isNative) {
  // Native's program gets __DEV__/setImmediate from react-native's types; the
  // vendored ambient file would redeclare them (const vs var) and clash.
  fs.rmSync(path.join(outSrc, 'vendor/core/global.d.ts'));

  // The runnable install needs the platform code and packaging aux files,
  // byte-unchanged from the product (npm pack applies the `files` allowlist
  // on top, e.g. trimming android/ to the published subset). Without these,
  // autolinking finds nothing to build and the native module doesn't exist
  // at runtime.
  const NATIVE_AUX = [
    'android',
    'apple',
    'shared',
    'scripts',
    'ReanimatedSwipeable',
    'ReanimatedDrawerLayout',
    'jest-utils',
    'jestSetup.js',
    'RNGestureHandler.podspec',
    'react-native.config.js',
    'README.md',
  ];
  for (const entry of NATIVE_AUX) {
    const from = path.join(product, entry);
    if (!fs.existsSync(from)) {
      continue;
    }
    if (fs.statSync(from).isDirectory()) {
      // android/build outputs would bloat the tarball; npm pack excludes
      // nothing inside allowlisted dirs, so skip build dirs while copying.
      copyTree(from, path.join(out, entry), (p) => !/\/build(\/|$)/.test(p));
    } else {
      fs.copyFileSync(from, path.join(out, entry));
    }
  }
}

// 3. specifier rewrite: workspace package names -> relative vendored paths
const CORE_PKG = '@swmansion/gesture-handler-core';
const ENGINE_PKG = '@swmansion/gesture-handler-dom-engine';

function rel(fromFile, toTarget) {
  let r = path
    .relative(path.dirname(fromFile), toTarget)
    .split(path.sep)
    .join('/');
  if (!r.startsWith('.')) {
    r = './' + r;
  }
  return r;
}

let rewritten = 0;
function rewriteFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const replaced = src
    .replace(
      new RegExp(`(['"])${CORE_PKG}/src/([^'"]+)\\1`, 'g'),
      (_, q, p) => `${q}${rel(file, path.join(outSrc, 'vendor/core', p))}${q}`
    )
    .replace(
      new RegExp(`(['"])${CORE_PKG}\\1`, 'g'),
      (_, q) => `${q}${rel(file, path.join(outSrc, 'vendor/core'))}${q}`
    )
    .replace(
      new RegExp(`(['"])${ENGINE_PKG}/src/([^'"]+)\\1`, 'g'),
      (_, q, p) =>
        `${q}${rel(file, path.join(outSrc, 'vendor/dom-engine', p))}${q}`
    )
    .replace(
      new RegExp(`(['"])${ENGINE_PKG}\\1`, 'g'),
      (_, q) => `${q}${rel(file, path.join(outSrc, 'vendor/dom-engine'))}${q}`
    );
  if (replaced !== src) {
    fs.writeFileSync(file, replaced);
    rewritten++;
  }
}
function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p, fn);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      fn(p);
    }
  }
}
walk(outSrc, rewriteFile);

// 4. package.json without the internal workspace deps
const pkg = JSON.parse(
  fs.readFileSync(path.join(product, 'package.json'), 'utf8')
);
delete pkg.dependencies?.[CORE_PKG];
delete pkg.dependencies?.[ENGINE_PKG];
// Lifecycle scripts reference repo-relative paths (e.g. native's prepack does
// `cp ../../README.md`) and must not run again when packing the staged
// layout; devDependencies are workspace-only tooling.
delete pkg.scripts;
delete pkg.devDependencies;
fs.writeFileSync(
  path.join(out, 'package.json'),
  JSON.stringify(pkg, null, 2) + '\n'
);

// 5. a tsconfig for verifying the packed tree
const tsconfig = {
  extends: '../../../tsconfig.json',
  compilerOptions: {
    exactOptionalPropertyTypes: true,
    types: isNative ? ['./src/global.d.ts'] : ['./src/vendor/core/global.d.ts'],
  },
  include: ['src/**/*.ts', 'src/**/*.tsx'],
};
fs.writeFileSync(
  path.join(out, 'tsconfig.json'),
  JSON.stringify(tsconfig, null, 2) + '\n'
);

// 6. self-containment gate
let leaks = 0;
walk(outSrc, (p) => {
  const s = fs.readFileSync(p, 'utf8');
  if (s.includes(CORE_PKG) || s.includes(ENGINE_PKG)) {
    console.error('LEAK:', path.relative(out, p));
    leaks++;
  }
});

console.log(
  `packed ${path.relative(repoRoot, out)} — ${rewritten} files rewritten, ${leaks} specifier leaks`
);
process.exit(leaks ? 1 : 0);
