#!/usr/bin/env node
// Agent-friendly summary of Playwright's JSON report.
// Exit: 0 = every test in THIS report passed; 1 = failures/flaky/interrupted/not run/skipped/runner errors; 2 = missing or invalid report.
// It does not prove the report matches the current code/input/build; record that provenance separately.
// Usage: node scripts/e2e-summary.mjs [test-results/results.json]
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const file = process.argv[2] ?? 'test-results/results.json';
const strip = (t) => String(t ?? '').replace(/\u001b\[[0-9;]*m/g, '');
const firstLines = (t, n = 6) => strip(t).split('\n').slice(0, n).join('\n    ');

if (!existsSync(file)) {
  console.log(`NO REPORT: ${file}; nothing verified. Run \`npm run e2e\` (never with --reporter).`);
  process.exit(2);
}

let report;
try {
  report = JSON.parse(readFileSync(file, 'utf8'));
  if (!report || !Array.isArray(report.suites) || !Array.isArray(report.errors) || !report.stats || !Number.isFinite(report.stats.duration)) {
    throw new Error('not a Playwright JSON report');
  }
} catch (e) {
  console.log(`BROKEN REPORT: ${file} (${e.message}); the run probably crashed. Nothing verified.`);
  process.exit(2);
}
console.log(`Report: ${file}; run started ${report.stats.startTime ?? 'unknown'}`);

// Current source state (context only, not provenance of the run).
try {
  const opts = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
  const head = execFileSync('git', ['--no-optional-locks', 'rev-parse', '--short', 'HEAD'], opts).trim();
  const parts = execFileSync('git', ['--no-optional-locks', 'status', '--porcelain=v1', '-z', '--untracked-files=all'], opts).split('\0');
  const entries = [];
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i]) continue;
    const entry = { status: parts[i].slice(0, 2), path: parts[i].slice(3) };
    if (/[RC]/.test(entry.status)) entry.from = parts[++i];
    entries.push(entry);
  }
  console.log(`Current HEAD ${head}; ${entries.length} uncommitted change(s)${entries.length ? ': ' + entries.slice(0, 20).map((e) => `${e.status.trim()} ${e.path}`).join(', ') + (entries.length > 20 ? ', ...' : '') : ''}`);
} catch {
  console.log('Current source state: unknown (git unavailable)');
}

const OUTCOMES = ['expected', 'unexpected', 'flaky', 'skipped'];
const STATUSES = ['passed', 'failed', 'timedOut', 'skipped', 'interrupted'];

function classify(test) {
  if (!OUTCOMES.includes(test.status) || !Array.isArray(test.results) || test.results.some((r) => !r || !STATUSES.includes(r.status))) {
    throw new Error('invalid Playwright test record');
  }
  const last = test.results.at(-1);
  if (!last) return 'notRun';
  if (test.results.some((r) => r.status === 'interrupted')) return 'interrupted';
  if (test.status === 'unexpected') return 'failed';
  if (test.status === 'flaky') return 'flaky';
  if (last.status === 'skipped') return test.expectedStatus === 'skipped' ? 'skipped' : 'notRun';
  if (test.status === 'expected' && last.status === test.expectedStatus) return last.status === 'passed' ? 'passed' : 'expectedFailure';
  return 'failed'; // inconsistent outcome/status: be conservative
}

const buckets = { passed: [], expectedFailure: [], failed: [], flaky: [], interrupted: [], notRun: [], skipped: [] };

function walk(suite, titles = []) {
  const path = suite.title ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const bucket = classify(test);
      const results = test.results;
      // Show the last failing attempt, so a passing retry doesn't hide the error.
      const detail = [...results].reverse().find((r) => ['failed', 'timedOut', 'interrupted'].includes(r.status)) ?? results.at(-1);
      const error = detail?.error ?? detail?.errors?.[0];
      const loc = detail?.errorLocation ?? error?.location;
      buckets[bucket].push({
        where: `${spec.file}:${spec.line}`,
        title: `[${test.projectName || test.projectId || 'default'}] ` + [...path.slice(1), spec.title].join(' > '),
        attempts: results.map((r) => `${r.retry ?? 0}:${r.status}`).join(', '),
        error: firstLines(error?.message || error?.value || error?.stack),
        at: loc ? `${loc.file}:${loc.line}` : '',
        artifacts: (detail?.attachments ?? []).filter((a) => a.path).map((a) => `${a.name}: ${a.path}`),
      });
    }
  }
  for (const child of suite.suites ?? []) walk(child, path);
}

try {
  for (const suite of report.suites) walk(suite);
} catch (e) {
  console.log(`BROKEN REPORT: ${e.message}`);
  process.exit(2);
}

const total = Object.values(buckets).reduce((n, list) => n + list.length, 0);
console.log('E2E: ' + Object.entries(buckets).map(([name, list]) => `${list.length} ${name}`).join(', ') + ` (${Math.round(report.stats.duration / 1000)}s)`);

for (const error of report.errors) {
  console.log('RUNNER ERROR (config/webServer/global setup; tests may not have run): ' + firstLines(error?.message || error?.value || error?.stack || JSON.stringify(error)));
}

for (const [name, list] of Object.entries(buckets)) {
  if (name === 'passed') continue;
  for (const item of list) {
    console.log(`\n[${name}] ${item.title}\n  spec: ${item.where}\n  attempts: ${item.attempts || 'none'}`);
    if (item.at) console.log(`  location: ${item.at}`);
    if (item.error) console.log(`  error:\n    ${item.error}`);
    for (const artifact of item.artifacts) console.log(`  ${artifact}`);
  }
}

if (!total) console.log('NO TESTS in this report: nothing verified.');
const bad = report.errors.length + (total - buckets.passed.length) + Number(!total);
if (bad) console.log('\nNext: read error-context.md (ARIA snapshot) and server output; classify app | selector | timing | data | harness | entry path; fix the cause; re-run the focused spec.');
process.exitCode = bad ? 1 : 0;
