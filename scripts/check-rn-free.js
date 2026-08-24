// Architecture gate for the split's internal packages: their sources must not
// reach react-native (or the RN-ecosystem packages reached via the injected
// runtime) by any import path, type-only included — platform access goes
// through the port.
//
//   node scripts/check-rn-free.js <src dir>
const fs = require('node:fs');

const { walk } = require('./fs-walk');

// Any specifier from the react-native ecosystem is forbidden: react-native
// itself, react-native-* packages, and the @react-native/* scope.
const SPECIFIER_RE =
  /(from\s+|require\(|import\()\s*['"]@?react-native[^'"]*['"]/;

const root = process.argv[2];
if (!root || !fs.existsSync(root)) {
  console.error('usage: node scripts/check-rn-free.js <src dir>');
  process.exit(1);
}

const offenders = [];
walk(root, (p) => {
  if (!/\.(ts|tsx|js|jsx)$/.test(p)) {
    return;
  }
  fs.readFileSync(p, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      if (SPECIFIER_RE.test(line)) {
        offenders.push(`${p}:${i + 1}: ${line.trim()}`);
      }
    });
});

if (offenders.length) {
  console.error(`check-rn-free: FAIL (${offenders.length} forbidden imports)`);
  for (const offender of offenders) {
    console.error(`  ${offender}`);
  }
  process.exit(1);
}
console.log(`check-rn-free: OK — ${root} is react-native-free`);
