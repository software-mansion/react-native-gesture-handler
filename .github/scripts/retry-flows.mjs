#!/usr/bin/env node
// Re-run argent flows that failed, up to --attempts times.
//
//   node .github/scripts/retry-flows.mjs .argent/flows -r --attempts 3
//   .github/scripts/retry-flows.mjs .argent/flows/basic-tap-test.yaml --device <udid>
//
// Only whole flows are retried, and only e2e ones - a fragment runs against
// whatever state the failed attempt left behind.

import { spawn } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';

const USAGE =
  'usage: retry-flows.mjs <flow|flow.yaml|dir> [--attempts n] [--device id] [--platform p] [--output dir] [-r]';

const argv = process.argv.slice(2);

function flagValue(name) {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  if (i + 1 === argv.length) {
    console.error(`${name} requires a value\n${USAGE}`);
    process.exit(2);
  }
  return argv[i + 1];
}

const target = argv.find((a) => !a.startsWith('-'));
if (!target) {
  console.error(USAGE);
  process.exit(2);
}

const attempts = Number(flagValue('--attempts') ?? 2);
if (!Number.isInteger(attempts) || attempts < 1) {
  console.error(
    `--attempts must be a positive integer, got ${flagValue('--attempts')}`
  );
  process.exit(2);
}

const passthrough = [];
for (const name of ['--device', '--platform', '--output']) {
  const value = flagValue(name);
  if (value !== undefined) passthrough.push(name, value);
}
const recursive = argv.includes('-r') || argv.includes('--recursive');

function runArgent(flowRef, extra) {
  return new Promise((resolve) => {
    const child = spawn(
      'argent',
      ['flow', 'run', flowRef, '--json', ...extra],
      {
        stdio: ['ignore', 'pipe', 'inherit'],
      }
    );
    let out = '';
    child.stdout.on('data', (chunk) => (out += chunk));
    child.on('close', (code) => {
      // Exit 2 paths (bad path, no tool server) print plain text on stderr and
      // leave stdout empty, so a parse failure is expected there.
      try {
        resolve({ code: code ?? 1, report: JSON.parse(out) });
      } catch {
        resolve({ code: code ?? 1 });
      }
    });
  });
}

// Argent calls a flow e2e when its first step other than `echo:`/`script:` is
// `launch:`. A directory is re-walked whole; a flow we cannot read does not get
// the benefit of the doubt.
async function isRetryable(flowRef) {
  const info = await stat(flowRef).catch(() => null);
  if (info?.isDirectory()) return true;
  const flowPath = flowRef.endsWith('.yaml')
    ? flowRef
    : `.argent/flows/${flowRef}.yaml`;
  let source;
  try {
    source = await readFile(flowPath, 'utf8');
  } catch {
    return false;
  }
  for (const [, step] of source.matchAll(/^\s*-\s*([\w-]+)\s*:/gm)) {
    if (step !== 'echo' && step !== 'script') return step === 'launch';
  }
  return false;
}

// A step that `error`ed hit the harness, not the app under test - the usual
// transient. A `fail` is the app disagreeing with an assert. Both are retried;
// the split only labels the log line.
function classify(code, report, errorKind) {
  if (code === 2 || errorKind === 'validation') return 'setup';
  if (!report) return 'transport';
  return report.errored > 0 ? 'errored' : 'failed';
}

function summarize(report) {
  if (!report) return 'no report';
  const bad = report.steps.find(
    (s) => s.status === 'fail' || s.status === 'error'
  );
  if (!bad) return 'unknown';
  const what = bad.target ? `${bad.kind} ${bad.target}` : bad.kind;
  return `step ${bad.index} ${what}: ${bad.reason ?? ''}`;
}

let pending = [target];
const passed = new Set();
const abandoned = [];
let lastCode = 0;

for (let attempt = 1; attempt <= attempts && pending.length > 0; attempt++) {
  if (attempt > 1) {
    console.log(
      `\n--- attempt ${attempt}/${attempts}: ${pending.length} flow(s) ---`
    );
  }
  const stillFailing = [];

  const consider = async (flowRef, kind, detail) => {
    console.log(`  FAIL ${flowRef} (${kind}) - ${detail}`);
    if (kind === 'setup') {
      console.log('       not retried: setup error, fix it first');
      abandoned.push(flowRef);
    } else if (await isRetryable(flowRef)) {
      stillFailing.push(flowRef);
    } else {
      console.log('       not retried: not an e2e flow (no leading launch:)');
      abandoned.push(flowRef);
    }
  };

  for (const ref of pending) {
    // Only the first pass walks a directory; a retry names each failed file.
    const extra =
      attempt === 1 && recursive
        ? [...passthrough, '--recursive']
        : passthrough;
    const { code, report } = await runArgent(ref, extra);
    lastCode = code;

    if (report && Array.isArray(report.flows)) {
      for (const entry of report.flows) {
        const flowPath = `${ref.replace(/\/$/, '')}/${entry.path}`;
        if (entry.status === 'pass') {
          passed.add(flowPath);
          continue;
        }
        // A flow the batch stopped short of gets a first run, not a retry, so
        // the fragment rule does not apply to it.
        if (entry.status === 'skip') {
          console.log(`  SKIP ${flowPath} - batch stopped before it ran`);
          stillFailing.push(flowPath);
          continue;
        }
        await consider(
          flowPath,
          classify(1, entry.report, entry.error_kind),
          entry.error ?? summarize(entry.report)
        );
      }
      continue;
    }

    if (code === 0) {
      passed.add(ref);
      continue;
    }
    await consider(ref, classify(code, report), summarize(report));
  }

  pending = stillFailing;
}

const flowCount = (n) => `${n} flow${n === 1 ? '' : 's'}`;
const unresolved = [...pending, ...abandoned];
const total = passed.size + unresolved.length;

if (unresolved.length === 0) {
  console.log(`\nPASS - ${flowCount(total)}`);
  process.exit(0);
}
console.log(
  `\nFAIL - ${unresolved.length} of ${flowCount(total)} unresolved after ${attempts} attempt(s):\n${unresolved.map((p) => `  ${p}`).join('\n')}`
);
process.exit(lastCode || 1);
