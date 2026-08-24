// Shared by the split packaging scripts: call fn(filePath) for every file
// under dir, recursively.
const fs = require('node:fs');
const path = require('node:path');

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

module.exports = { walk };
