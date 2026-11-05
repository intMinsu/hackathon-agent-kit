# AGENTS.md

## Product
{{one-paragraph summary}}
- Requirements: {{spec files}} (authoritative). Task settings: docs/TASK_PROFILE.md.
- Current state: the Resume section of docs/PLANS.md (the only place for current state). History: docs/JOURNAL.md (Korean).
- Times: freeze {{FREEZE}}, deadline {{DEADLINE}} (authority: {{time authority}}).

## On every (re)entry: compaction, resume, new session
1. Read this file and the PLANS.md Resume section, then check the clock and `git status`.
2. If `phase: ended`, do not build or start new tests. Only answer questions or do explicitly requested wrap-up.
3. If `phase: frozen`, only fixes, verification and submission docs.
4. Otherwise continue from "next action".

## Commands
- Human/preview server: {{dev command}} on {{dev port}}. The real user entry is {{preview URL / proxy / iframe}}.
- E2E runs its own server on {{e2e port}} with E2E=1. `npm run verify` is the definition of green.
- One spec: `npx playwright test e2e/<file>.spec.ts[:line] --reporter=line`
- Failure summary: `npm run e2e:summary`
- Independent checks (if the task computes/assigns/aggregates): {{check command}}
- Clock: `date -Iseconds` (POSIX) or `Get-Date -Format o` (PowerShell).

## Required criteria → flows → evidence
{{table: criterion | flow | e2e spec | independent check (if any) | milestone}}

## Milestone loop (details: .agents/skills/e2e-loop/SKILL.md, or .kit/.agents/skills/e2e-loop/SKILL.md)
1. Spec first: write or extend `e2e/<flow>.spec.ts` (one `test.step` per user-visible step, plus a negative case). See it fail for the right reason.
2. Implement. For computed results, also add or extend the independent check.
3. Re-run only what the change affects (matrix in the skill). New specs get a `--repeat-each=3` flake check.
4. At integration points, run `npm run verify`.
5. Update Resume, add a JOURNAL entry, then commit `M<n>: <what> - verified by <evidence> (<counts>)`.

No JOURNAL entry, no next milestone.

## Verification rules
- E2E proves user flows. It does not prove computed results are correct. For any calculation, assignment, optimisation or aggregation, an independent checker must:
  - recompute constraints/invariants from the raw input
  - not import the implementation's logic
  - report violations with counts
- The real access path counts. From the first feature on, check login → core task → reload → logout through {{preview URL}}, not only localhost.
- Evidence is tied to a state. Record commit + dirty/clean, input version or hash, environment, command, counts and duration. Never reuse evidence from different code, input or build.
- Report each run separately (focused, repeat, full verify). Never merge counts from different runs.

## E2E rules
- Selectors: getByRole / getByLabel / getByText; data-testid only as a fallback. Waits: web-first `expect` only; never `waitForTimeout` or `networkidle`.
- Reset/seed through the E2E-only endpoint in `beforeEach`. Use `workers: 1` while state is shared.
- External services: fake only the outbound transport when E2E=1. Fix "today" with `E2E_TODAY`.
- Synthetic data only.

## Test integrity
- Never weaken a required criterion or suppress failures to get green: no skip, `.only`, `fixme`, deletion or loosened assertions for that purpose.
- You may fix a demonstrably wrong selector, fixture or expectation. Log the evidence in the PLANS.md Decision Log. Suspect the app first.

## Questions and decisions
- Business or policy questions (whose answer changes the design): send at most 3, once, early, as one message. Write down the assumption you are using, and keep doing work that doesn't depend on the answer.
- Technical choices: decide yourself and log them in the Decision Log. Never present an assumption as an agreed business rule.

## Parallel work (only if TASK_PROFILE allows; max {{max workers}})
- Main owns requirements, shared types/contracts, dependencies, config, DB schema, git, Resume/JOURNAL, the E2E server, and full verify.
- A worker starts only with: its owned files, the interface contract, its acceptance check and a time limit.
- A worker returns an 8-line handoff:

  ```
  ID/owner | goal & acceptance | files changed | interface | commands run → counts (failed/not run) | evidence state (commit/dirty, input) | ports/processes still held | risks & Main's next step
  ```
- Main does not re-run a worker's passing check unless something it depends on changed.

## UI baseline (check at first integration, not at the end)
- Each role's main task works end-to-end at 1440px and 390px (or the task's target widths).
- Body/table text 14–16px; secondary text 12–14px; no overflow; visible focus.
- Every metric shows unit, period, denominator and which direction is better. "No data" is distinct from 0.
- Plain words over jargon. Don't add features the spec excluded.

## Time, scope and ending
- At a milestone's budget expiry, replan against the remaining wall time. Cut optional work first. Never silently drop a required criterion; report it as unmet.
- A blocker gets at most 10 minutes, then use a fallback or cut scope (and log it).
- At freeze: no new features; run the freeze checklist.
- If the human or the platform announces the end, it overrides the planned deadline:
  1. Set `phase: ended` with the time and source.
  2. Stop safely, preserve data and artifacts, and don't kill shared services.
  3. Mark submission `confirmed` only with real evidence.

## Working style
- Secrets only via env vars. Never print or commit them.
- Log human corrections in JOURNAL as "human intervention".
- Commit on the current branch. Never force-push.

## Freeze checklist
1. `npm run verify` and the independent checks are green; record the counts and evidence state.
2. Production or required runtime (build/start, DB restart, container): check what the spec requires, through the real access path.
3. Run each critical flow spec with `--repeat-each=3`.
4. README: run, test, env vars, limitations.
5. PLANS.md Outcomes: including cut scope.
6. Submission docs in the exact format the spec asks for (default: Korean Q1/Q2 in docs/SUBMISSION_QA.md).
