#!/usr/bin/env node
// Compact, agent-friendly summary of Playwright's JSON report.
// Usage: node scripts/e2e-summary.mjs [test-results/results.json]
import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2] ?? 'test-results/results.json';
if (!existsSync(file)) {
  console.log(`No report at ${file}. Run \`npm run e2e\` first (json reporter must be enabled).`);
  process.exit(2);
}

const report = JSON.parse(readFileSync(file, 'utf8'));
const s = report.stats ?? {};
console.log(
  `E2E: ${s.expected ?? 0} passed, ${s.unexpected ?? 0} failed, ${s.flaky ?? 0} flaky, ` +
    `${s.skipped ?? 0} skipped (${Math.round((s.duration ?? 0) / 1000)}s)`,
);

const strip = (t = '') => t.replace(/\u001b\[[0-9;]*m/g, '');
const failures = [];

function walk(suite, titles = []) {
  const path = suite.title ? [...titles, suite.title] : titles;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      if (test.status === 'expected' || test.status === 'skipped') continue;
      const last = test.results?.at(-1) ?? {};
      failures.push({
        where: `${spec.file}:${spec.line}`,
        title: [...path.slice(1), spec.title].join(' > '),
        status: test.status,
        error: strip(last.error?.message ?? last.errors?.[0]?.message ?? '').split('\n').slice(0, 6).join('\n    '),
        at: last.error?.location ? `${last.error.location.file}:${last.error.location.line}` : '',
        artifacts: (last.attachments ?? []).filter((a) => a.path).map((a) => `${a.name}: ${a.path}`),
      });
    }
  }
  for (const child of suite.suites ?? []) walk(child, path);
}
for (const suite of report.suites ?? []) walk(suite);

for (const err of report.errors ?? []) {
  failures.push({ where: 'global', title: 'runner error', status: 'error', error: strip(err.message).split('\n').slice(0, 6).join('\n    '), at: '', artifacts: [] });
}

failures.forEach((f, i) => {
  console.log(`\n#${i + 1} [${f.status}] ${f.title}\n  spec: ${f.where}${f.at ? `  (failed at ${f.at})` : ''}\n  error:\n    ${f.error}`);
  if (f.artifacts.length) console.log(`  artifacts:\n    ${f.artifacts.join('\n    ')}`);
});

if (failures.length) {
  console.log('\nNext: read error-context.md (ARIA snapshot) above, classify root cause (app | selector | timing | data | harness), fix, re-run the single spec.');
}
process.exit(failures.length ? 1 : 0);
