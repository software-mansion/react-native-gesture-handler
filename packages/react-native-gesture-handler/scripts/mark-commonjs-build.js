// Run after `bob build`: flips `IS_COMMONJS_BUILD` to `true` in the
// `lib/commonjs` output so `src/cjsGuard.ts` can detect that the CommonJS
// artifact ended up inside a React Native app bundle. See that file for why
// this can't be decided at runtime.
const fs = require('fs');
const path = require('path');

const flavorPath = path.join(
  __dirname,
  '..',
  'lib',
  'commonjs',
  'cjsBuildFlavor.js'
);

const source = fs.readFileSync(flavorPath, 'utf8');

if (!source.includes('IS_COMMONJS_BUILD = false')) {
  throw new Error(
    `Expected \`IS_COMMONJS_BUILD = false\` in ${flavorPath} — did the shape of src/cjsBuildFlavor.ts change?`
  );
}

fs.writeFileSync(
  flavorPath,
  source.replace('IS_COMMONJS_BUILD = false', 'IS_COMMONJS_BUILD = true')
);

console.log('Marked lib/commonjs build (IS_COMMONJS_BUILD = true)');
