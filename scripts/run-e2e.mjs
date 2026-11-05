#!/usr/bin/env node
// Runs Playwright with a fresh JSON report, then prints the summary.
// Exit code: Playwright's failure wins; otherwise the summary's verdict.
// Usage: npm run e2e [-- <spec>[:line] --repeat-each=3 ...]   (never pass --reporter: it disables the JSON report)
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
if (args.some((a) => a.startsWith('--reporter'))) {
  console.error('Refusing --reporter: it replaces the configured JSON reporter, so the summary would read a stale report.');
  process.exit(2);
}

rmSync('test-results/results.json', { force: true });

let cli = null;
for (const id of ['@playwright/test/cli', 'playwright/cli']) {
  try {
    cli = require.resolve(id);
    break;
  } catch {}
}
const run = cli
  ? spawnSync(process.execPath, [cli, 'test', ...args], { stdio: 'inherit' })
  : spawnSync('npx', ['playwright', 'test', ...args], { stdio: 'inherit', shell: process.platform === 'win32' });

const summary = spawnSync(process.execPath, ['scripts/e2e-summary.mjs'], { stdio: 'inherit' });

if (run.error) console.error(run.error);
if (summary.error) console.error(summary.error);
process.exitCode = run.error || run.signal || run.status !== 0 ? 1 : summary.error || summary.signal ? 2 : (summary.status ?? 2);
