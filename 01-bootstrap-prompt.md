You are my engineering agent for a time-boxed hackathon. I (the human) steer; you build. Read this whole file before acting.

## Inputs (from my start message; anything missing comes from the spec)
- `GOAL_FILE`: the task spec. It is authoritative for requirements, deliverables and constraints.
- `START`, plus `FREEZE` and `DEADLINE` (absolute or relative to START). If absent, take them from the spec or the platform display.
- `CONTINUE=yes|no` (default `no`): whether to keep going after Phase 0 without stopping.
- Workers: `WORKERS=<n>` (default 2).

## Kit (pre-made, public, no product code), at `.kit/`
- `core/AGENTS.template.md`: our operating contract. Its rules apply from now on, before the file exists.
- `templates/TASK_PROFILE.md`: task settings that you fill in.
- `.agents/skills/e2e-loop/SKILL.md`: how every milestone is built, verified and healed. Read it now.
- `scripts/e2e-summary.mjs`: an honest summary of the latest Playwright report.

## Phase 0 (hard cap: START + 30 min)
Outcome: confirmed task settings, a running app on the real entry path, one green browser smoke through `npm run verify`, and a compact plan. Don't build features yet.

1. **Profile (≤5 min).**
   - Read the spec and any starter code. Fill `docs/TASK_PROFILE.md` from the template, marking every value `spec | human | observed | assumed`.
   - Decide stack, persistence, auth/roles and containers **from the spec**. Kit defaults apply only where the spec is silent:
     - TypeScript + Next.js App Router, one Node process
     - JSON file store with atomic writes
     - no auth
     - avoid native-build dependencies
   - Record tool availability: `/goal`, subagents, writable `.agents`, browser. Never depend on a tool marked `unknown`.
2. **Questions (≤2 min).** If business or policy questions would change the design, send them now as one message (max 3), each with the assumption you will use meanwhile. Then continue.
3. **Preflight (≤5 min).**
   - Check OS/shell, Node/npm, git state, network, whether Playwright Chromium launches, reserved ports, and the real user entry (preview URL / proxy / iframe).
   - Never overwrite an existing AGENTS.md/README; merge into it.
   - If something blocks setup, report the exact prerequisite instead of looping.
4. **Scaffold + harness.**
   - App serves its home page on the dev port.
   - Playwright Test:
     - Install `@playwright/test` and `chromium`.
     - `testDir: 'e2e'`, `workers: 1`, `fullyParallel: false`, `retries: 0`, `timeout: 30_000`, `expect.timeout: 5_000`.
     - `use`: headless, `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`.
     - `reporter: [['line'], ['json', { outputFile: 'test-results/results.json' }], ['html', { open: 'never' }]]`.
     - `webServer` on a **dedicated E2E port** (default 3100) with env `{ E2E: '1', E2E_TODAY: '<fixed date>' }`, `reuseExistingServer: false`, `timeout: 180_000`, `stdout: 'pipe'`. Its readiness `url` is a real UI route.
   - E2E mode:
     - Fake only the outbound transport of external APIs, with fixtures for success / empty / malformed / error.
     - "Today" comes from `E2E_TODAY`.
     - Expose a reset/seed endpoint that is enabled only when E2E=1.
   - Install the kit pieces:
     - Copy `scripts/e2e-summary.mjs` into the project.
     - Copy the e2e-loop skill to `.agents/skills/e2e-loop`. If that path is read-only or managed, reference `.kit/...` directly instead.
     - Add `.kit/` to `.gitignore`.
   - Scripts:
     - `typecheck`
     - `e2e`
     - `e2e:summary`
     - `test:unit` (only if useful)
     - `check:independent` (only if the task computes, assigns or aggregates)
     - `verify` = all of the above that exist. No new lint stack, no no-op scripts.
   - `e2e/smoke.spec.ts`: the home page renders its main heading, with no console or page errors.
   - If login is required: a smoke that logs in, reloads, and logs out.
   - Run `npm run verify` until green. Also open the real entry path once (or report why you can't).
5. **Docs (compact).**
   - `docs/PLANS.md`:
     - **Resume**, at most 20 lines and the only current state. Fields: `phase`, `updated_at`, `time_authority`, `product_checkpoint`, `working_changes`, `active_workers`, `services` (role/port/DB), `latest_evidence`, `open_decisions`, `next_action`, `submission_status`.
     - Milestones M1..Mn ordered by required-criterion value. Each has scope, files, evidence (spec / independent check) and a budget, all fitting before FREEZE with 15 min of slack.
     - Decision Log, Surprises, Outcomes.
   - `docs/JOURNAL.md` (Korean): one entry per milestone, at most 8 lines.
   - `AGENTS.md`: from `.kit/core/AGENTS.template.md` with placeholders filled, at most 120 lines.
   - `.gitignore`: `.env*` (except `.env.example`), test artifacts, data files.
6. **Commit** `M0: scaffold + harness - verified by npm run verify (<counts>)`. Record the start commit in JOURNAL.
7. **Report:**
   - (a) required criteria → flows → evidence → milestones with budgets
   - (b) verify counts, plus whether the real entry path works
   - (c) assumptions and pending questions
   - (d) tool availability
   - (e) the exact next instruction. If `/goal` is supported, use the `/goal` line from `.kit/02-goal-command.txt`. If not, give a plain "continue" instruction.

   - If `CONTINUE=no`: STOP after the report. Recommend I start a fresh session so AGENTS.md is auto-loaded.
   - If `CONTINUE=yes`: after the report, continue straight into M1 following AGENTS.md.

If Phase 0 is not green at the cap, report the actual results and the blocker. Do not mark M0 verified.
