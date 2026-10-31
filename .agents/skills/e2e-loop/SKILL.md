---
name: e2e-loop
description: Use for every feature, bug fix, or failing Playwright test in this project. Drives the spec → red → implement → green → flake-check → verify loop with Playwright E2E as the definition of done, and the failure triage (healer) procedure.
---

# E2E loop (planner → generator → healer, done by one agent)

Playwright E2E tests are this project's executable spec and its sensor. A feature does not exist until a spec proves it.

## 1. Plan (planner)
- Take one required criterion from AGENTS.md's criteria table.
- Write down the user-visible steps and critical assertions, plus at least one negative case. These become `test.step` names.

## 2. Generate (generator)
- Write or extend `e2e/<flow>.spec.ts`:
  - one `test.step('<user-visible step>')` per step
  - getByRole / getByLabel / getByText selectors
  - web-first `expect` only
  - reset/seed via the E2E-only endpoint in `beforeEach`
- Run `npx playwright test e2e/<flow>.spec.ts --reporter=line`. It must fail **for the right reason**: the feature is missing, not a typo or harness error.

## 3. Implement
- Make the smallest change that satisfies the spec.
- Re-run the single spec until green.

## 4. Flake check and verify
- New or changed spec: `npx playwright test e2e/<flow>.spec.ts --repeat-each=3`. Any failure means it is flaky; fix it now, because flakes destroy trust.
- Then `npm run verify` (the definition of green).

## 5. Heal (when anything fails)
1. Run `npm run e2e:summary`. It gives a compact list of failures with file:line, error and artifact paths.
2. Read the failing test's `error-context.md` (ARIA snapshot of the page at failure) and the server output.
3. Only if still unclear, read the trace: `npx playwright show-trace <trace.zip>`, or the `npx playwright trace` CLI if available.
4. Classify the root cause: app bug | selector | timing | test data | harness config.
5. Fix the cause, never the symptom. Suspect the app first.
   - Never weaken a required assertion, skip, `.only`, `fixme`, or delete a test to get green.
   - Correcting a demonstrably wrong selector or expectation is allowed. Log the evidence in the PLANS.md Decision Log.
6. Re-run the single spec, then `npm run verify`.
7. A blocker gets at most 10 minutes, then pick a fallback or cut scope (log it).

## 6. Record (evidence for judges)
- Add a JOURNAL.md entry (Korean, at most 8 lines) covering:
  - what now works
  - the spec name and command result counts
  - what the red run caught
  - any healing done (root cause class → fix)
- Commit `M<n>: <what> - verified by <spec> (<n> passed)`.
