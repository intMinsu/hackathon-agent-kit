Prepare the submission docs in the **exact format and questions the spec asks for** (see TASK_PROFILE deliverables). If the spec gives none, write docs/SUBMISSION_QA.md in Korean with the default questions below.

Evidence rules:
- Base claims on repository history (`git log --stat` from the start commit in JOURNAL) and on the latest completed evidence that matches the relevant product code, input and runtime.
- Quote each run's scope, counts and evidence state. Re-run only affected checks, and only when time permits.
- If `phase: ended`, use existing artifacts only and mark unverified claims explicitly.
- Don't add up counts from different runs. If something wasn't verified (live API, production path, real entry path), say so plainly.

Default Q1. 핵심 모듈 구현 및 검증 방법
- Table: 모듈 | 책임 | 핵심 파일 | 설계 결정(이유) | 검증(E2E spec / 독립 검증 / 단언 내용) | 최근 결과 | 한계
- One paragraph on the verification harness:
  - E2E as the definition of done for user flows
  - an independent checker for computed results
  - verification through the real entry path
  - a dedicated E2E server with transport-level fakes
  - a fixed date
  - flake checks

Default Q2. Agent를 어떻게 썼고 어떤 부분을 바꿨는지
- Setup:
  - the pre-made kit (public repo, no product code)
  - AGENTS.md contract and TASK_PROFILE
  - the e2e-loop skill
  - /goal (if used)
  - workers actually spawned and their handoffs
  - model/effort per phase
- Changes table: 처음 접근 | 바꾼 것 | 계기(테스트 실패 / 독립 검증 / 사람 개입 / 시간) | 커밋. Include only actual changes; fewer than three rows is fine.
- What we changed from default agent workflows, and why:
  - E2E-first done
  - anti-test-weakening
  - independent checks
  - change-based re-verification
  - Resume/phase state
- Human interventions. If there were none in a phase, say so.

Keep each answer to about one page and skimmable. Commit the docs, then print them in the chat.
