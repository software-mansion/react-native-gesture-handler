// Transitional 2-package publishing bridge (split plan, Part-1 prerequisite):
// keep every published react-native-gesture-handler tarball a self-contained
// single package while the sources live in multiple workspace packages.
//
// Wired as npm lifecycle scripts of the product package (cwd = package dir):
//   prepack:  node ../../scripts/vendor-for-pack.js prepack
//   postpack: node ../../scripts/vendor-for-pack.js postpack
//
// prepack: back up src/ + package.json, vendor the @swmansion/gesture-handler-*
// workspace deps (transitive closure) into src/vendor/<name>, rewrite their
// specifiers to relative paths, strip them from the manifest, rebuild lib/
// over the vendored tree, then gate on zero surviving workspace specifiers.
// postpack: restore the tree exactly as found. With no internal deps declared
// (pre-split state) both steps reduce to the old README copy/remove.
//
// The pack itself stays plain `npm pack` with the regular `files` allowlist,
// so android/apple/shared/podspec/react-native.config.js/jest-utils and the
// rest of the native aux surface ship byte-unchanged by construction.
//
// Env: RNGH_PACK_SKIP_BUILD=1 skips the lib/ rebuild (rehearsals without
// node_modules); a leftover backup from a crashed run is restored on the next
// prepack. `restore` runs the postpack cleanup manually.
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
// npm runs lifecycle scripts with cwd set to the package being packed.
const pkgDir = process.cwd();
if (!pkgDir.startsWith(path.join(repoRoot, 'packages') + path.sep)) {
  console.error(
    `vendor-for-pack: run from a package dir under packages/ (cwd: ${pkgDir})`
  );
  process.exit(1);
}
const backupDir = path.join(pkgDir, '.pack-vendor-backup');
const srcDir = path.join(pkgDir, 'src');
const vendorDir = path.join(srcDir, 'vendor');
const manifestPath = path.join(pkgDir, 'package.json');
const readmePath = path.join(pkgDir, 'README.md');

const SCOPE_PREFIX = '@swmansion/gesture-handler-';
const TEST_DIR_RE =
  /(^|\/)(__tests__|__mocks__|__fixtures__|__typetests__)(\/|$)/;

function readManifest(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

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

function walk(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p, fn);
    } else {
      fn(p);
    }
  }
}

// Internal workspace deps of the product manifest, expanded to the closure
// over the internal deps of the vendored packages themselves (engine -> core).
function discoverInternalPackages(manifest) {
  const byName = new Map();
  for (const dir of fs.readdirSync(path.join(repoRoot, 'packages'))) {
    const file = path.join(repoRoot, 'packages', dir, 'package.json');
    if (!fs.existsSync(file)) {
      continue;
    }
    const name = readManifest(file).name;
    if (name?.startsWith(SCOPE_PREFIX)) {
      byName.set(name, path.join(repoRoot, 'packages', dir));
    }
  }

  const queue = Object.keys(manifest.dependencies ?? {}).filter((d) =>
    d.startsWith(SCOPE_PREFIX)
  );
  const found = new Map();
  while (queue.length) {
    const name = queue.shift();
    if (found.has(name)) {
      continue;
    }
    const dir = byName.get(name);
    if (!dir) {
      throw new Error(`internal dependency ${name} has no workspace package`);
    }
    found.set(name, {
      name,
      dir,
      shortName: name.slice(SCOPE_PREFIX.length),
    });
    for (const dep of Object.keys(
      readManifest(path.join(dir, 'package.json')).dependencies ?? {}
    )) {
      if (dep.startsWith(SCOPE_PREFIX)) {
        queue.push(dep);
      }
    }
  }
  return [...found.values()];
}

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

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rewriteSpecifiers(internal) {
  let rewritten = 0;
  walk(srcDir, (file) => {
    if (!/\.(ts|tsx)$/.test(file)) {
      return;
    }
    const before = fs.readFileSync(file, 'utf8');
    let after = before;
    for (const pkg of internal) {
      const vendored = path.join(vendorDir, pkg.shortName);
      const bareTarget = fs.existsSync(path.join(vendored, 'index.ts'))
        ? path.join(vendored, 'index')
        : vendored;
      after = after
        .replace(
          new RegExp(`(['"])${escapeRegExp(pkg.name)}/src/([^'"]+)\\1`, 'g'),
          (_, q, p) => `${q}${rel(file, path.join(vendored, p))}${q}`
        )
        .replace(
          new RegExp(`(['"])${escapeRegExp(pkg.name)}(/src)?\\1`, 'g'),
          (_, q) => `${q}${rel(file, bareTarget)}${q}`
        );
    }
    if (after !== before) {
      fs.writeFileSync(file, after);
      rewritten++;
    }
  });
  return rewritten;
}

// Fail the pack if any internal specifier survives in the content that ships.
function leakGate() {
  const leaks = [];
  for (const root of [srcDir, path.join(pkgDir, 'lib'), manifestPath]) {
    if (!fs.existsSync(root)) {
      continue;
    }
    const check = (p) => {
      if (fs.readFileSync(p, 'utf8').includes(SCOPE_PREFIX)) {
        leaks.push(path.relative(pkgDir, p));
      }
    };
    if (fs.statSync(root).isDirectory()) {
      walk(root, check);
    } else {
      check(root);
    }
  }
  if (leaks.length) {
    console.error(
      `vendor-for-pack: ${SCOPE_PREFIX}* specifiers leaked into the pack:`
    );
    for (const leak of leaks) {
      console.error(`  ${leak}`);
    }
    process.exit(1);
  }
}

function restore({ removeReadme }) {
  if (removeReadme && fs.existsSync(readmePath)) {
    fs.rmSync(readmePath);
  }
  if (!fs.existsSync(backupDir)) {
    return false;
  }
  fs.rmSync(srcDir, { recursive: true, force: true });
  fs.renameSync(path.join(backupDir, 'src'), srcDir);
  fs.renameSync(path.join(backupDir, 'package.json'), manifestPath);
  fs.rmSync(backupDir, { recursive: true, force: true });
  return true;
}

function prepack() {
  if (restore({ removeReadme: false })) {
    console.log(
      'vendor-for-pack: restored leftover backup from a previous run'
    );
  }
  fs.copyFileSync(path.join(repoRoot, 'README.md'), readmePath);

  const manifest = readManifest(manifestPath);
  const internal = discoverInternalPackages(manifest);
  if (internal.length === 0) {
    console.log(
      'vendor-for-pack: no internal workspace deps — nothing to vendor'
    );
    return;
  }

  fs.mkdirSync(backupDir);
  fs.copyFileSync(manifestPath, path.join(backupDir, 'package.json'));
  fs.cpSync(srcDir, path.join(backupDir, 'src'), { recursive: true });

  for (const pkg of internal) {
    copyTree(
      path.join(pkg.dir, 'src'),
      path.join(vendorDir, pkg.shortName),
      (p) => !TEST_DIR_RE.test(p.split(path.sep).join('/'))
    );
    // The product program takes __DEV__ etc. from react-native's types; a
    // vendored ambient global.d.ts would redeclare them and clash.
    if (fs.existsSync(path.join(srcDir, 'global.d.ts'))) {
      fs.rmSync(path.join(vendorDir, pkg.shortName, 'global.d.ts'), {
        force: true,
      });
    }
  }

  const rewritten = rewriteSpecifiers(internal);

  for (const pkg of internal) {
    delete manifest.dependencies[pkg.name];
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  if (process.env.RNGH_PACK_SKIP_BUILD) {
    console.log('vendor-for-pack: RNGH_PACK_SKIP_BUILD set — lib/ not rebuilt');
  } else {
    fs.rmSync(path.join(pkgDir, 'lib'), { recursive: true, force: true });
    execSync('yarn build', { cwd: pkgDir, stdio: 'inherit' });
  }

  leakGate();
  console.log(
    `vendor-for-pack: vendored ${internal
      .map((p) => p.name)
      .join(', ')} — ${rewritten} files rewritten, 0 leaks`
  );
}

function postpack() {
  if (restore({ removeReadme: true })) {
    console.log(
      'vendor-for-pack: tree restored; note that lib/ still holds the vendored build — `yarn build` regenerates the workspace one'
    );
  }
}

const command = process.argv[2];
if (command === 'prepack') {
  prepack();
} else if (command === 'postpack' || command === 'restore') {
  postpack();
} else {
  console.error(
    'usage: node scripts/vendor-for-pack.js <prepack|postpack|restore>'
  );
  process.exit(1);
}
