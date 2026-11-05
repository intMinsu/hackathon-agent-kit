Prepare `docs/ANSWER_PREP.md` (Korean) so the human can write the written answers **alone, without AI**, after the product deadline. You must finish it **before the product deadline**. After that you stop: no drafting or polishing of answers.

The questions are about 6, and they look like:
- how the harness was designed and why
- how agent failures were noticed and fixed
- how things were verified
- (possibly) how the core modules work, and what was changed

Sources:
- `git log --stat` from the start commit in JOURNAL
- docs/JOURNAL.md (especially the "에이전트 문제" entries)
- docs/PLANS.md Decision Log
- docs/SOLUTION_BRIEF.md
- e2e/ and checks/
- the latest completed verify and independent-check results

Quote counts with their scope. Mark anything unverified as 미검증. Never invent episodes.

## Structure (at most ~2 pages; skimmable; the human must be able to recall it)
1. **One-paragraph story**: the problem → our approach → the result (key numbers versus the baseline).
2. **Predicted questions (8-10)**, each with:
   - a 3-5 bullet answer skeleton: claim → why → concrete evidence (file, commit hash, counts)
   - one concrete episode to cite

   Cover:
   - Harness design and **why**: AGENTS.md contract, role split (Main/researcher/web/qa with their efforts and the reasons), contract-first, E2E as the definition of done, independent checker, real-entry-path checks, change-based verification, Resume/phase state, test-integrity rule.
   - **Agent failures and fixes**, 2-4 real episodes from JOURNAL: symptom → how it was noticed (test, checker, human, persona answer) → root cause → fix → what changed in the harness or prompt so it wouldn't recur.
   - **Verification**: what each layer proves and doesn't prove (E2E vs independent checker vs unit vs human preview smoke); final counts with their evidence state; what stayed unverified.
   - Core modules and algorithm choice: why this method over the baseline; trade-offs (average vs worst case).
   - Human role: interventions, persona questions and how their answers changed the design.
   - What we'd do differently.
3. **Key facts sheet**: numbers, file names, commit hashes and timeline, as a compact table to memorize.

Commit it, then tell the human it is ready and to review it before the deadline.
