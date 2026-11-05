# AGENTS.md

## Product
{{one-paragraph summary}}
- Requirements: docs/TASK_SPEC.md (verbatim copy of {{spec file}}; read-only; never edit the original). Task settings: docs/TASK_PROFILE.md. Contracts: docs/CONTRACTS.md. Method: docs/SOLUTION_BRIEF.md.
- Current state: the Resume section of docs/PLANS.md (the only place for current state). History: docs/JOURNAL.md (Korean).
- Times: freeze {{FREEZE}}, deadline {{DEADLINE}} (authority: {{time authority}}).

## On every (re)entry: compaction, resume, new session
1. Read this file and the PLANS.md Resume section, then check the clock and `git status`.
2. If `phase: ended`, do not build or start new tests. Only answer questions or do explicitly requested wrap-up. If `phase: answering`, only the written answers; no product changes.
3. If `phase: frozen`, only fixes, verification and submission docs.
4. Otherwise continue from "next action".

## Commands
- Human/preview server: {{dev command}} on {{dev port}}. The real user entry is {{preview URL / proxy / iframe}}.
- E2E runs its own server on {{e2e port}} with E2E=1. `npm run verify` is the definition of green.
- One spec: `npm run e2e -- e2e/<file>.spec.ts[:line]`. Never pass `--reporter`: it disables the JSON report.
- `scripts/run-e2e.mjs` deletes the old report, runs Playwright and prints the summary. Re-print it with `npm run e2e:summary`.
- Independent checks (if the task computes/assigns/aggregates): {{check command}}
- Clock: `date -Iseconds` (POSIX) or `Get-Date -Format o` (PowerShell).

## Required criteria → flows → evidence
{{table: criterion | flow | e2e spec | independent check (if any) | milestone}}

## Milestone loop (details: {{e2e-loop path: .agents/skills/e2e-loop/SKILL.md or docs/agent/e2e-loop.md}})
1. Spec first: write or extend `e2e/<flow>.spec.ts` (one `test.step` per user-visible step, plus a negative case). See it fail for the right reason.
2. Implement. For computed results, also add or extend the independent check.
3. Re-run only what the change affects (matrix in the skill). Once the spec is stable, run each new or changed spec once with `--repeat-each=3` at milestone end, not after every edit.
4. At integration points, QA runs `npm run verify` (one runner at a time).
5. Update Resume (replace it in place, never append), add a JOURNAL entry, then commit `M<n>: <what> - verified by <evidence> (<counts>)`.

## Verification rules
- E2E proves user flows. It does not prove computed results are correct. For any calculation, assignment, optimisation or aggregation, an independent checker must:
  - read the raw input and the actual persisted/exported output of the run being reported; never import production calculation logic
  - verify the required constraints, completeness/unique IDs, and the displayed/exported aggregates (including denominators); use a tiny hand-checked fixture plus the full task dataset
  - print input/output hashes, checked counts, violations and a baseline comparison; exit nonzero on any acceptance violation
- The real entry path counts.
  - At first integration, and after any auth/proxy/runtime change, test the normal app (E2E off) inside the actual platform iframe/proxy with a fresh browser context.
  - For each role: login → permitted task → reload → logout. Forbidden actions must be rejected server-side.
  - Check base paths, redirects, cookie Domain/Path, `SameSite=None; Secure` when cross-site, X-Frame-Options and CSP `frame-ancestors`.
  - If automation can't reach the real iframe, ask the human for a one-minute smoke right away. Until then, mark the path unverified. Opening the URL directly is diagnostic only.
- Evidence belongs to a tested scope. Record:
  - command/scope
  - commit plus the relevant content identity (including untracked files)
  - input/output identity
  - environment, counts and duration

  Reuse after unrelated changes only when those dependencies are unchanged (see the skill's matrix). A different HEAD alone neither invalidates nor validates evidence. The final state gets a fresh full verify and independent check.
- Report each run separately (focused, repeat, full verify). Never merge counts from different runs.

## E2E rules
- Selectors: getByRole / getByLabel / getByText; data-testid only as a fallback. Waits: web-first `expect` only; never `waitForTimeout` or `networkidle`.
- Reset/seed through the E2E-only endpoint in `beforeEach`. Use `workers: 1` while state is shared.
- E2E uses its own database/schema/namespace with the required engine. Refuse reset unless that isolation is confirmed. E2E stays off on the human preview.
- External services: fake only the outbound transport when E2E=1. Fix "today" with `E2E_TODAY`.
- Data:
  - Use the input files the spec provides, including the full sample, for realistic and full-input checks.
  - Fixtures you create are synthetic.
  - Never use real personal data.

## Test integrity
- Never weaken a required criterion or suppress failures to get green: no skip, `.only`, `fixme`, deletion or loosened assertions for that purpose.
- You may fix a demonstrably wrong selector, fixture or expectation. Log the evidence in the PLANS.md Decision Log. Suspect the app first.

## Questions and decisions
- Business or policy questions (whose answer changes the design): send at most 3, once, early, as one message. Write down the assumption you are using, and keep doing work that doesn't depend on the answer.
- Technical choices: decide yourself and log them in the Decision Log. Never present an assumption as an agreed business rule.

## Team (roles: .codex/agents/*.toml; max {{max workers}} workers)
| Role | Owns | Effort |
|---|---|---|
| Main (you) | requirements, docs/CONTRACTS.md, shared types, DB schema, deps, config, git, Resume/JOURNAL, integration | xhigh |
| researcher | docs/SOLUTION_BRIEF.md, then the solver/domain module | max |
| web | pages, components, route handlers; UI baseline (in web.toml) | high |
| qa | e2e/**, checks/**, the E2E server/port, every full `npm run verify` from M1 on (Main ran M0), real-entry-path checks | high |

- Spawn order:
  - researcher right after the profile
  - qa once criteria and contracts exist
  - web once contracts exist
- If the named roles aren't available, spawn a generic agent with:
  - model `gpt-6.1-sol` and the explicit effort (researcher=max, web=high, qa=high)
  - the full `developer_instructions` from `.codex/agents/<role>.toml`
  - the task context

  Record the effective settings in Resume.
- The milestone loop is split by owner:
  - QA writes the specs and checkers, and runs the checks.
  - The product owners (web, researcher, Main) implement the fixes.
  - Main integrates.
- Contract-first: before parallel coding, Main publishes docs/CONTRACTS.md (API shapes, entities, roles, UI labels / accessible names). Only Main changes it, and Main notifies the affected roles.
- Only the files a worker owns are writable for that worker. The solver's author never writes the checker.
- A worker returns an 8-line handoff:

  ```
  ID/owner | goal & acceptance | files changed | interface | commands run → counts (failed/not run) | evidence state (commit/dirty, input) | ports/processes still held | risks & Main's next step
  ```
- Main does not re-run a worker's passing check unless something it depends on changed.

## Time, scope and ending
- At a milestone's budget expiry, replan against the remaining wall time. Cut optional work first. Never silently drop a required criterion; report it as unmet.
- A blocker gets at most 10 minutes, then use a fallback or cut scope (and log it).
- Check the clock before each milestone and before/after long commands. Store absolute times with timezone. A command's timeout must fit the remaining time.
- At FREEZE, or when the human says freeze: set `phase: frozen` first, then run the freeze checklist.
- If written answers are due after the product (ANSWERS_DEADLINE), then at DEADLINE set `phase: answering`:
  - Make no product code, config or data changes.
  - Start no new builds or tests.
  - Write only the organizers' questions, in their format, from existing evidence (`.kit/03-submission-qa-prompt.md`).
  - At ANSWERS_DEADLINE, apply the end steps below.
- At the final deadline, or when the human or platform announces the end (this overrides the plan):
  1. Set `phase: ended` with the time and source.
  2. Notify workers, stop owned work safely, preserve data and artifacts, and don't kill shared services.
  3. Start no new builds or tests. Requested wrap-up uses existing evidence.
  4. Mark submission `confirmed` only with real evidence.

## Working style
- Secrets only via env vars. Never print or commit them.
- Log human corrections in JOURNAL as "human intervention".
- Commit on the current branch. Never force-push.

## Freeze checklist
1. Run `npm run verify` (including the independent checks) once. Record the results, scope and evidence state.
2. Production or required runtime (build/start, DB restart, container): check what the spec requires, through the real entry path.
3. Reuse matching repeat evidence. Repeat only the critical flows whose code, input or runtime changed since.
4. `docs/RUN.md`: run, test, env vars, limitations. Never edit the spec file (e.g. README.md). If README content seems required, tell the human.
5. Final JOURNAL entry: outcomes, including cut scope.
6. Submission docs in the exact format the spec asks for (default: Korean Q1/Q2 in docs/SUBMISSION_QA.md).
