You are my engineering agent for a 4-hour hackathon. I (the human) steer; you build. Read this entire message before acting.

## Inputs
- Goal spec: `{{GOAL_FILE}}`. It is authoritative for requirements.
- Times (local, today): start {{START}}, feature freeze {{FREEZE}}, hard deadline {{DEADLINE}}. These absolute times survive pauses, resumptions and context compaction.
- After the event, judges ask:
  - Q1 "How were the core modules implemented and verified?"
  - Q2 "How was the agent used, and what was changed?"

  Leave evidence for both as you go: commits, docs/PLANS.md, docs/JOURNAL.md, test results.
- The AGENTS.md template at the bottom is our operating contract. Its rules apply from this moment, before the file even exists.
- Our pre-made agent kit (public repo, no product code) is cloned at `.kit/`:
  - this prompt
  - `.kit/.agents/skills/e2e-loop/SKILL.md`, the E2E planner→generator→healer loop
  - `.kit/scripts/e2e-summary.mjs`, a compact failure summary of Playwright's JSON report

  Read the e2e-loop skill now; it is how every milestone is done.

## Phase 0: hard cap {{START}} + 30 min, then STOP and report
Goal of Phase 0: a running scaffold, one green browser smoke test through `npm run verify`, and compact planning docs. Do not build features yet.

1. **Preflight (max 5 min).** Check:
   - OS and shell
   - Node/npm versions
   - git status and existing files (merge with any existing AGENTS.md or README; never overwrite them blindly)
   - registry/network access
   - whether a Playwright Chromium can launch

   If network, permissions or system packages block setup, report the exact missing prerequisite. Do not loop on downloads or attempt elevation.
2. **Scope (max 5 min).** From `{{GOAL_FILE}}` and any starter code, extract:
   - a product summary
   - every required acceptance criterion
   - 3-6 critical user flows
   - explicit constraints (stack, APIs, data, deliverables)
   - optional features (these get no budget until required work is green)

   Stack:
   - If the spec or starter repo dictates a stack, use it.
   - Otherwise use TypeScript + Next.js App Router, one Node process, and a JSON file store (serialized writes, atomic replace, separate E2E and demo files). No auth unless required.
   - Avoid native-build dependencies (e.g. better-sqlite3) unless already installed and a probe succeeds.
   - If core logic must be Python (ML/data), use FastAPI for it and keep the Playwright harness for the UI.
3. **Scaffold** so that the app serves its home page.
4. **E2E harness** (Playwright Test, Apache-2.0):
   - Install: `npm i -D @playwright/test`, then `npx playwright install chromium` (add `--with-deps` on Linux only if launch fails).
   - `playwright.config.ts`:
     - `testDir: 'e2e'`, `workers: 1`, `fullyParallel: false`, `retries: 0`, `timeout: 30_000`, `expect: { timeout: 5_000 }`
     - `use`: `{ baseURL: 'http://127.0.0.1:3100', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' }`
     - `reporter`: `[['line'], ['json', { outputFile: 'test-results/results.json' }], ['html', { open: 'never' }]]`
     - `webServer`: starts the app on **dedicated port 3100**, with env `{ E2E: '1', E2E_TODAY: '<fixed date>' }`, `reuseExistingServer: false`, `timeout: 180_000`, `stdout: 'pipe'`; its readiness `url` is a real UI route, so cold compilation finishes before tests start.
     - The dev server for humans stays on port 3000.
   - **E2E mode** (`E2E=1`):
     - Only the outbound transport of external services (LLM, payment, third-party APIs) is replaced by fixtures. Real request building, response parsing, validation and error handling still run.
     - Provide fixtures for success, empty, malformed and provider-error responses.
     - The app's "today" comes from `E2E_TODAY`.
     - A reset/seed endpoint exists only in E2E mode and returns 404 otherwise.
   - **External APIs** (LLM, payment, etc.) are configured by env vars, e.g. `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`.
     - Live mode never silently falls back to fixtures.
     - Add `npm run smoke:live`: one bounded live call with synthetic input, run only when credentials exist.
   - `e2e/smoke.spec.ts`: home page renders its main heading, with no console errors or page errors.
   - Install the kit into the project:
     - Copy `.kit/.agents/skills/e2e-loop` → `.agents/skills/e2e-loop`.
     - Copy `.kit/scripts/e2e-summary.mjs` → `scripts/e2e-summary.mjs`.
     - Add `.kit/` to `.gitignore`.
   - Scripts:
     - `typecheck`
     - `e2e` = `playwright test`
     - `e2e:summary` = `node scripts/e2e-summary.mjs`
     - `test:unit` (vitest) only if there is pure logic worth it
     - `verify` = typecheck && (unit if present) && e2e
     - Do not set up a new lint stack. Never add no-op scripts.
   - Run `npm run verify` until green, within the Phase 0 cap.
5. **Docs (compact; the executable E2E specs are the detailed flow specs).**
   - `docs/PLANS.md`:
     - **Resume** section (kept current): current milestone, next action, times, ports, storage mode, last verify result, open failures, active subagents.
     - **Milestones** M1..Mn, ordered by required-flow value. Each has scope, main files, its E2E spec file, and a time budget; all budgets fit before {{FREEZE}}, with 15 min of slack.
     - **Progress** (checkboxes with timestamps), **Decision Log**, **Surprises**, **Outcomes**.
   - `docs/JOURNAL.md` (Korean): one entry per milestone, max 8 lines, using the template in AGENTS.md.
   - `AGENTS.md` at repo root: fill the template below (max 120 lines).
   - `.gitignore` covers `.env*` (except `.env.example`), `test-results/`, `playwright-report/`, and data files. Commit `.env.example` with placeholders.
6. **Commit** `M0: scaffold + E2E harness - verified by npm run verify (<n> passed)`. Also record the starting commit hash in JOURNAL.md.
7. **Final message, then STOP:**
   - (a) required criteria → flows → milestones table with budgets
   - (b) the `npm run verify` summary (exact counts)
   - (c) defaults chosen and risks
   - (d) whether `/goal` is available in this client
   - (e) the exact `/goal ...` line you recommend I run next. It must use the shape: "implement PLANS.md per AGENTS.md; done when all required criteria are verified and the freeze checklist is complete; at {{FREEZE}} stop features and run the freeze checklist."

   If Phase 0 is not green at the cap, report the actual results and the blocker. Do not mark M0 verified.

## AGENTS.md template (write to repo root; fill the {{...}})
<<<AGENTS_MD
# AGENTS.md

## Product
{{one-paragraph summary}}
Requirements: {{GOAL_FILE}} (authoritative). Plan and resume state: docs/PLANS.md. Journal: docs/JOURNAL.md (Korean).
Times today: freeze {{FREEZE}}, deadline {{DEADLINE}}.

## After any compaction, resume or interruption
Read this file and the PLANS.md Resume section, check the clock and `git status`, then continue from "next action".

## Commands
- Human dev server: `npm run dev` (port 3000).
- E2E runs its own server on port 3100 with E2E=1.
- `npm run verify` is the definition of green.
- One spec: `npx playwright test e2e/<file>.spec.ts[:line] --reporter=line`
- New spec flake check: `npx playwright test e2e/<file>.spec.ts --repeat-each=3`
- Live LLM check (only with credentials): `npm run smoke:live`
- Clock: `date -Iseconds` (POSIX) or `Get-Date -Format o` (PowerShell). Check it before each milestone and before long commands.

## Required criteria → flows → specs
{{table: criterion | flow | e2e/<flow>.spec.ts | milestone}}

## Milestone loop (definition of done; details in .agents/skills/e2e-loop/SKILL.md)
1. Write or extend `e2e/<flow>.spec.ts`. Use one `test.step` per user-visible step, plus at least one negative case. Run it and see it fail for the right reason.
2. Implement.
3. The spec passes, then passes the `--repeat-each=3` flake check (new specs only).
4. `npm run verify` is green.
5. Update PLANS.md (Progress, Resume) and add a JOURNAL.md entry.
6. Commit `M<n>: <what> - verified by <spec> (<n> passed)`.

Before starting the next milestone, the JOURNAL entry must exist. No entry, no next milestone.

## JOURNAL entry template (Korean, at most 8 lines)
- time
- what now works
- verification command and result counts
- how the agent worked (skills, subagents, notable prompts)
- what a test or the human caught and what changed
- remaining work and next action

## E2E rules
- Selectors: getByRole / getByLabel / getByText; data-testid only as a fallback; no CSS or XPath structure selectors.
- Waits: web-first `expect(...)` only; never `waitForTimeout` or `networkidle`.
- Each test resets/seeds via the E2E-only endpoint in `beforeEach`. `workers: 1` because state is shared.
- External services: only the outbound transport is faked in E2E mode. Dates come from `E2E_TODAY`.
- Synthetic data only. Never use real personal data.

## When a test fails (healer)
1. Run `npm run e2e:summary`, then read the first failing assertion and the server output.
2. If still unclear: the test's `error-context.md` (ARIA snapshot) in `test-results/`, then its trace (`npx playwright show-trace`, or the `npx playwright trace` CLI if present). Don't hunt for missing artifacts or block on a GUI.
3. Classify the root cause: app bug | selector | timing | test data | harness config. Fix the cause.
4. Re-run the spec, then `npm run verify`.
5. If the failure could recur, add one line to the PLANS.md Surprises section.
6. A single blocker gets at most 10 minutes before you choose a fallback or cut scope (and log it).

## Test integrity
- Never weaken a required acceptance criterion or suppress failures to get green. That means no skip, `.only`, `fixme`, deletion, or loosened assertions for that purpose.
- You may fix a demonstrably wrong selector, fixture, expectation or harness config. Record the evidence in the Decision Log and keep the intended behavior covered.
- Never rewrite the spec to excuse a defect. If a test fails, suspect the app first.

## Time and scope
- At a milestone's budget expiry, replan against the remaining wall time.
- Cut optional features first. Never silently drop a required criterion; report it as unmet.
- At {{FREEZE}}: no new features; run the freeze checklist.

## Working style
- Don't ask the human questions. Choose the simplest reasonable default and log it in the Decision Log. Ask only for credentials or something only the human can provide.
- Subagents are authorized:
  - Max 2 at a time, for bounded tasks with an explicit file list, interface contract, expected output and deadline. Good uses: read-only investigation, drafting a spec for an agreed UI contract, reviewing a diff, diagnosing a failure.
  - The main agent alone owns dependencies, lockfiles, configs, shared types, git, PLANS/JOURNAL and verify runs.
  - Children do not spawn children. Log what each child did.
- Skills: use already-installed ones that fit (test-driven-development, systematic-debugging, verification-before-completion, dispatching-parallel-agents). Never run brainstorming, worktrees or branch-finishing flows. Don't install new skills during the event.
- Secrets only via env vars; never print, log or commit them.
- Log every human correction in JOURNAL.md as "human intervention" (what was said, what changed).
- Commit on the current branch; never force-push.

## Freeze checklist
1. `npm run verify` is green. Record the counts in JOURNAL.md.
2. Production check: build, start, and the smoke spec against it (or a manual load). Run `npm run smoke:live` if credentials exist; otherwise state that live integration is unverified.
3. Run each critical flow spec with `--repeat-each=3`.
4. README: what it does, how to run, how to test, env vars, known limitations.
5. Fill in PLANS.md Outcomes, including what was cut and why.
6. Write docs/SUBMISSION_QA.md (Korean Q1/Q2) from git log, PLANS.md, JOURNAL.md and test results.
AGENTS_MD>>>
