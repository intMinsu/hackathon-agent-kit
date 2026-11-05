#!/usr/bin/env node
// Honest, agent-friendly summary of Playwright's JSON report.
// Distinguishes: no report | broken report | stale report | runner errors | interrupted | not run | failed | flaky | passed.
// Usage: node scripts/e2e-summary.mjs [test-results/results.json]
// Exit codes: 0 all passed, 1 failures/flaky/interrupted/not run, 2 no or broken report.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';

const file = process.argv[2] ?? 'test-results/results.json';
const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};
const strip = (t = '') => t.replace(/\u001b\[[0-9;]*m/g, '');
const firstLines = (t, n = 6) => strip(t).split('\n').slice(0, n).join('\n    ');

if (!existsSync(file)) {
  console.log(`NO REPORT at ${file}. Run \`npm run e2e\` (the json reporter must write there). Nothing is verified.`);
  process.exit(2);
}

let report;
try {
  report = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.log(`BROKEN REPORT at ${file} (${e.message}). The run probably crashed or is still writing. Re-run; nothing is verified.`);
  process.exit(2);
}

// Which code state does this report describe?
const reportTime = statSync(file).mtime;
const head = sh('git log -1 --format="%h %cI"') || 'unknown';
const dirty = sh('git status --porcelain --untracked-files=no').split('\n').filter(Boolean);
const changedAfter = dirty
  .map((l) => l.slice(3).replace(/^"|"$/g, ''))
  .filter((p) => existsSync(p) && statSync(p).mtime > reportTime);
console.log(`Report: ${file} @ ${reportTime.toISOString()} | HEAD ${head} | ${dirty.length ? `${dirty.length} uncommitted file(s)` : 'clean'}`);
if (changedAfter.length) {
  console.log(`STALE: ${changedAfter.length} file(s) changed after this report (e.g. ${changedAfter.slice(0, 3).join(', ')}). Re-run before trusting it.`);
}

const s = report.stats ?? {};
const buckets = { failed: [], flaky: [], interrupted: [], notRun: [] };

function walk(suite, titles = []) {
  const path = suite.title ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const results = test.results ?? [];
      const last = results.at(-1);
      const item = {
        where: `${spec.file}:${spec.line}`,
        title: [...path.slice(1), spec.title].join(' > '),
        error: firstLines(last?.error?.message ?? last?.errors?.[0]?.message ?? ''),
        at: last?.error?.location ? `${last.error.location.file}:${last.error.location.line}` : '',
        artifacts: (last?.attachments ?? []).filter((a) => a.path).map((a) => `${a.name}: ${a.path}`),
      };
      if (!last) buckets.notRun.push(item);
      else if (results.some((r) => r.status === 'interrupted')) buckets.interrupted.push(item);
      else if (test.status === 'unexpected') buckets.failed.push(item);
      else if (test.status === 'flaky') buckets.flaky.push(item);
      else if (test.status === 'skipped' && last.status === 'skipped' && !test.annotations?.length) buckets.notRun.push(item);
    }
  }
  for (const child of suite.suites ?? []) walk(child, path);
}
for (const suite of report.suites ?? []) walk(suite);

console.log(
  `E2E: ${s.expected ?? 0} passed, ${buckets.failed.length} failed, ${buckets.flaky.length} flaky, ` +
    `${buckets.interrupted.length} interrupted, ${buckets.notRun.length} not run, ${s.skipped ?? 0} skipped ` +
    `(${Math.round((s.duration ?? 0) / 1000)}s)`,
);

const globalErrors = report.errors ?? [];
if (globalErrors.length) {
  console.log(`\nRUNNER ERRORS (${globalErrors.length}): config, webServer or global setup failed; tests may not have run.`);
  globalErrors.forEach((e, i) => console.log(`  ${i + 1}. ${firstLines(e.message)}`));
}

const show = (label, list) => {
  list.forEach((f, i) => {
    console.log(`\n[${label} ${i + 1}] ${f.title}\n  spec: ${f.where}${f.at ? `  (failed at ${f.at})` : ''}`);
    if (f.error) console.log(`  error:\n    ${f.error}`);
    if (f.artifacts.length) console.log(`  artifacts:\n    ${f.artifacts.join('\n    ')}`);
  });
};
show('FAILED', buckets.failed);
show('FLAKY', buckets.flaky);
show('INTERRUPTED', buckets.interrupted);
if (buckets.notRun.length) console.log(`\nNOT RUN: ${buckets.notRun.map((f) => f.where).join(', ')}`);

const bad = globalErrors.length + buckets.failed.length + buckets.flaky.length + buckets.interrupted.length + buckets.notRun.length;
if (bad) {
  console.log('\nNext: read error-context.md (ARIA snapshot) and server output; classify app | selector | timing | data | harness | entry path; fix; re-run the focused spec.');
}
process.exit(bad || changedAfter.length ? 1 : 0);
