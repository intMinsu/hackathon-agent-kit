---
name: e2e-loop
description: Use for every feature, bug fix, or failing check in this project. The spec → red → implement → targeted verification → integrate loop. Playwright E2E proves user flows, independent checks prove computed results, and the healer procedure handles failures.
---

# E2E loop (planner → generator → healer)

With a team, the steps are split by owner:
- QA plans and writes the specs and checkers, and runs the checks.
- The product owners implement and fix.
- Main integrates.

Solo, one agent does all of it.

E2E tests are the executable spec for user flows. Independent checks are the spec for computed results. A feature doesn't exist until its evidence passes **in the state you are reporting**.

## 1. Plan
- Pick one required criterion from AGENTS.md.
- Write down the user-visible steps, the critical assertions and at least one negative case.
- If the criterion produces computed results (assignment, schedule, totals, scores), also list the invariants: hard constraints, capacities, time windows, conservation/totals, and comparison against a simple baseline.

## 2. Generate (red first)
- Write or extend `e2e/<flow>.spec.ts`:
  - one `test.step` per user step
  - role/label/text selectors
  - web-first `expect`
  - reset/seed in `beforeEach`
- Go through the real entry path when login, proxy or iframe matter.
- For computed results, write or extend the independent checker:
  - it reads raw input and output
  - it never imports the implementation's logic
  - it prints violations with counts
- Run them. They must fail **for the right reason** (feature missing), not because of a typo or the harness.

## 3. Implement
Make the smallest change that satisfies the spec, then re-run until green.

## 4. Verify what the change affects

| Changed | Must re-run | May reuse (if inputs and code it depends on are unchanged) |
|---|---|---|
| calculation / assignment / aggregation | unit boundaries + independent check on real/full input + baseline comparison | login and static UI evidence |
| auth / session / entry path | login → task → reload → logout via the real entry path (HTTPS/iframe if used); keep demo and normal sessions separate | independent-check results |
| storage / versioning / runtime | atomicity, restore of old input, restart of the required DB / production / container | unaffected UI evidence |
| UI / copy / style | affected screens: values, sizes, keyboard, widths 1440/390, errors; rebuild if deployed | independent-check results (same input/output hash) |
| docs only | links, commands and config match reality; no secrets in the diff | all product evidence, no E2E needed |

- New or changed spec: once it is stable, run it once with `--repeat-each=3` at milestone end. An intermittent failure (sometimes passes) is a flake, so fix it now. A consistent failure is a bug, not a flake.
- Run full `npm run verify` at integration points (end of a milestone, before freeze), not after every edit.
- Record each run separately: command, counts, duration, commit plus dirty/clean, and input version.

## 5. Heal (when anything fails)
1. Read the failing command's output.
   - For E2E, `npm run e2e` already printed the summary of that run; re-print it with `npm run e2e:summary`.
   - The summary classifies outcomes (failed / flaky / interrupted / not run / skipped / runner error). It does not prove the report matches the current code.
   - Focused runs: `npm run e2e -- <spec>`. Never pass `--reporter`.
2. Read the failing test's `error-context.md` (ARIA snapshot) and the server output.
3. Read the trace only if still unclear (`npx playwright show-trace <zip>`).
4. Classify the root cause: app bug | selector | timing | test data | harness | environment/entry path.
5. Fix the cause. Suspect the app first.
   - Never weaken a required assertion, or skip/`fixme`/delete a test, to get green.
   - You may fix a demonstrably wrong selector or expectation; log the evidence.
6. Re-run the focused check, then the affected set from the table.
7. A blocker gets at most 10 minutes, then use a fallback or cut scope (and log it).

## 6. Record
- JOURNAL entry (Korean, at most 8 lines):
  - what works now
  - evidence (each command → counts)
  - what the red run or the healer caught
  - human interventions
  - any "에이전트 문제" (symptom → how it was noticed → root cause → fix → harness/prompt change)
  - next step
- Update the Resume section (state only, not history).
- Commit `M<n>: <what> - verified by <evidence> (<counts>)`.
