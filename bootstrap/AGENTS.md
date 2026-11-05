<!-- hackathon-agent-kit bootstrap: Phase 0 replaces this file with the full contract and keeps the Event section. -->
# AGENTS.md

## Event (times are KST, today)
- Spec: `{{SPEC}}`. **Read-only: never edit, reformat or append to it** (requirements come from the verbatim copy docs/TASK_SPEC.md).
- Start {{START}} · Feature freeze {{FREEZE}} · **Product deadline {{DEADLINE}}** · Written answers {{DEADLINE}}–{{ANSWERS}}
- **The written answers (about 6 questions on harness design and rationale, how agent failures were fixed, and how things were verified) are written by the human WITHOUT AI.**
  - Before {{DEADLINE}} you may prepare `docs/ANSWER_PREP.md` (predicted questions and evidence notes).
  - At {{DEADLINE}} you stop completely (`phase: ended`): no product changes and no help with the answers.
- The IDE has a **persona/stakeholder agent** (e.g. an HR-team agent) for business questions. You can't reach it directly. Write questions for it as a copy-paste-ready Korean message; the human relays them and pastes back the answers.

## What to do on any message in this session
1. If `docs/PLANS.md` does not exist yet: **start Phase 0 now, without asking me anything first.**
   - Read and follow `.kit/01-bootstrap-prompt.md` with `GOAL_FILE={{SPEC}} START={{START}} FREEZE={{FREEZE}} DEADLINE={{DEADLINE}} CONTINUE=yes WORKERS=3`.
   - If a goal tool is available and no goal is active, set this goal: "Deliver {{SPEC}} per AGENTS.md by {{DEADLINE}} KST, with docs/ANSWER_PREP.md ready before {{DEADLINE}}."
2. If `docs/PLANS.md` exists: read AGENTS.md and the PLANS.md Resume, check the clock (`date`), then continue from "next action".
3. Treat my messages as steering:
   - "freeze now" = phase `frozen`: run the freeze checklist and write ANSWER_PREP (`.kit/03-submission-qa-prompt.md`).
   - "persona: ..." = the stakeholder agent's answer. Record it as source `stakeholder` in the Decision Log and apply it.

## Session setup (done by .kit/start.sh)
- Main: gpt-6.1-sol, reasoning xhigh, web search on if allowed.
- Roles in `.codex/agents/`: researcher (max), web (high), qa (high). You are explicitly authorized to spawn them.
- The human toggles `/fast`.
