// Barrel-diff gate for Part 1: for every source module that existed on main,
// compare its resolved export-name set between the main tree and the current
// split-base tree. Stubs must re-export exactly the names the original had.
//
// Compare against a reference worktree, e.g.:
//   git worktree add --detach /tmp/main-ref main
//   node scripts/export-surface-diff.js /tmp/main-ref/packages/react-native-gesture-handler/src packages/react-native-gesture-handler/src
const path = require('node:path');
const ts = require('typescript');

const { walk } = require('./fs-walk');

if (process.argv.length < 4) {
  console.error(
    'usage: node scripts/export-surface-diff.js <referenceSrcDir> <currentSrcDir>'
  );
  process.exit(1);
}
const [mainSrc, currentSrc] = process.argv.slice(2).map((p) => path.resolve(p));

const TEST_DIR_RE = /(^|\/)(__tests__|__mocks__|__fixtures__|__typetests__)\//;

function listModules(root) {
  const out = [];

  walk(root, (p) => {
    const rel = path.relative(root, p).split(path.sep).join('/');
    if (
      /\.(ts|tsx)$/.test(rel) &&
      !rel.endsWith('.d.ts') &&
      !TEST_DIR_RE.test(rel)
    ) {
      out.push(rel);
    }
  });

  return out;
}

function exportsByModule(root, relativePaths) {
  const files = relativePaths.map((r) => path.join(root, r));
  const program = ts.createProgram(files, {
    allowJs: false,
    jsx: ts.JsxEmit.React,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    esModuleInterop: true,
    skipLibCheck: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const result = new Map();
  for (const rel of relativePaths) {
    const sf = program.getSourceFile(path.join(root, rel));
    if (!sf) {
      result.set(rel, null);
      continue;
    }
    const symbol = checker.getSymbolAtLocation(sf);
    if (!symbol) {
      // Script file with no exports (e.g. ambient) — treat as empty.
      result.set(rel, []);
      continue;
    }
    const names = checker
      .getExportsOfModule(symbol)
      .map((s) => s.getName())
      .sort();
    result.set(rel, names);
  }
  return result;
}

const mainModules = listModules(mainSrc);
const mainExports = exportsByModule(mainSrc, mainModules);
const currentExports = exportsByModule(currentSrc, mainModules);

let missingFiles = 0;
let changed = 0;
let identical = 0;
for (const rel of mainModules) {
  const before = mainExports.get(rel);
  const after = currentExports.get(rel);
  if (after === null) {
    console.log(`MISSING  ${rel}`);
    missingFiles++;
    continue;
  }
  const b = JSON.stringify(before);
  const a = JSON.stringify(after);
  if (a !== b) {
    changed++;
    const lost = before.filter((n) => !after.includes(n));
    const gained = after.filter((n) => !before.includes(n));
    console.log(`CHANGED  ${rel}`);
    if (lost.length) {
      console.log(`  lost:   ${lost.join(', ')}`);
    }
    if (gained.length) {
      console.log(`  gained: ${gained.join(', ')}`);
    }
  } else {
    identical++;
  }
}
console.log(
  `\nexport-surface-diff: ${mainModules.length} modules — ${identical} identical, ${changed} changed, ${missingFiles} missing`
);
process.exit(changed || missingFiles ? 1 : 0);
