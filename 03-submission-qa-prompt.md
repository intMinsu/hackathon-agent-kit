Write (or finish) docs/SUBMISSION_QA.md in Korean, answering the two judge questions.

Evidence rules:
- Base every claim on `git log --stat` (from the starting commit in JOURNAL.md), docs/PLANS.md, docs/JOURNAL.md, e2e/, and a fresh `npm run verify` that you run now (quote the exact counts).
- No claim without evidence. If something was not verified, live LLM integration included, say so plainly.

Q1. 핵심 모듈 구현 및 검증 방법
- Table: 모듈 | 책임 | 핵심 구현 파일 | 핵심 설계 결정(이유) | 검증한 E2E spec과 단언 내용 | 최근 결과 | 한계
- One short paragraph on the verification harness:
  - Playwright E2E as the definition of done
  - dedicated E2E server with E2E=1
  - transport-level fakes for external APIs
  - fixed date
  - seed/reset
  - flake checks
  - production build check

Q2. Agent를 어떻게 썼고 어떤 부분을 바꿨는지
- Setup:
  - the starting prompt and AGENTS.md (operating contract)
  - Playwright harness
  - skills actually used
  - /goal
  - subagents actually spawned (what each did)
  - model and reasoning-effort settings per phase
- Changes table: 처음 접근 | 무엇을 바꿨나 | 계기(테스트 실패 / 사람 개입 / 시간 제약) | 커밋 hash
  - 3-5 concrete rows from JOURNAL.md and git log.
- What we changed from default agent workflows, and why:
  - skipped brainstorming, worktrees and per-task review for time
  - test-integrity rule against test weakening
  - E2E-first definition of done
  - Resume section for context compaction
- Human interventions: what I steered and why. If there were none in a phase, say "no human intervention".

Keep each answer to about one page and skimmable. Commit the file, then print both answers in the chat.
