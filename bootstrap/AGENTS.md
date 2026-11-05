<!-- hackathon-agent-kit bootstrap: Phase 0 replaces this file with the full contract and keeps the Event section. -->
# AGENTS.md

## Event (times are KST, today)
- Spec: `{{SPEC}}`. **Read-only: never edit, reformat or append to it** (requirements come from the verbatim copy docs/TASK_SPEC.md).
- Start {{START}} · Feature freeze {{FREEZE}} · **Product deadline {{DEADLINE}}** · **Written answers deadline {{ANSWERS}}**
- After {{DEADLINE}}: no product code, config or data changes. Only the written answers (the organizers' questions, e.g. 6 서술형), from existing evidence, until {{ANSWERS}}.

## What to do on any message in this session
1. If `docs/PLANS.md` does not exist yet: **start Phase 0 now, without asking me anything first.**
   - Read and follow `.kit/01-bootstrap-prompt.md` with `GOAL_FILE={{SPEC}} START={{START}} FREEZE={{FREEZE}} DEADLINE={{DEADLINE}} ANSWERS_DEADLINE={{ANSWERS}} CONTINUE=yes WORKERS=3`.
   - If a goal tool is available and no goal is active, set this goal: "Deliver {{SPEC}} per AGENTS.md by {{DEADLINE}} KST, then the written answers by {{ANSWERS}} KST."
2. If `docs/PLANS.md` exists: read AGENTS.md and the PLANS.md Resume, check the clock (`date`), then continue from "next action".
3. Treat my messages as steering. "freeze now" = go to phase `frozen`. "answers now" = go to phase `answering` (run `.kit/03-submission-qa-prompt.md`).

## Session setup (done by .kit/start.sh)
- Main: gpt-6.1-sol, reasoning xhigh, web search on if allowed.
- Roles in `.codex/agents/`: researcher (max), web (high), qa (high). You are explicitly authorized to spawn them.
- The human toggles `/fast`.
