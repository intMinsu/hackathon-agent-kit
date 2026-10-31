# hackathon-agent-kit

이 저장소는 Codex CLI(gpt-6.1-sol)로 4시간 해커톤을 진행하기 위한 에이전트 운영 킷이에요. **제품 코드는 들어 있지 않아요.** 프롬프트, 운영 계약(AGENTS.md 템플릿), E2E 루프 스킬, 실패 요약 스크립트만 있어요.

핵심 아이디어: **Playwright E2E 테스트가 실행 가능한 명세이자 완료 기준이에요.** 에이전트는 기능마다 다음 루프를 돌아요.

spec 작성 → 실패(red) 확인 → 구현 → 통과(green) → flake 체크 → `npm run verify` → JOURNAL 기록 → 커밋

테스트가 실패하면 `e2e:summary` → ARIA 스냅샷 → trace 순서로 원인을 분류하고, 증상이 아니라 원인을 고쳐요(healer).

## 빠른 시작 (작업 폴더에서)

```bash
git clone --depth 1 https://github.com/intMinsu/hackathon-agent-kit .kit
codex -m gpt-6.1-sol -c model_reasoning_effort='"high"' \
  -s workspace-write -c sandbox_workspace_write.network_access=true -a on-request
```

Codex가 열리면 첫 메시지로 아래를 보내요.

```
Read .kit/01-bootstrap-prompt.md and execute it exactly. GOAL_FILE=<과제 파일>, START=<HH:MM>, FREEZE=<시작+3:20>, DEADLINE=<시작+4:00>.
```

그다음 순서는 `RUNBOOK.md`를 따라요: 0단계 보고 검토 → `02-goal-command.txt`로 `/goal` 시작 → 동결 시각에 `03-submission-qa-prompt.md`.

## 파일

| 파일 | 내용 |
|---|---|
| `01-bootstrap-prompt.md` | 0단계 지시 + AGENTS.md 템플릿(운영 계약) |
| `02-goal-command.txt` | `/goal` 문장 |
| `03-submission-qa-prompt.md` | Q1/Q2 답변 초안 프롬프트 |
| `RUNBOOK.md` | 사람용 진행표(추론 강도, 모니터링, 동결) |
| `.agents/skills/e2e-loop/SKILL.md` | planner → generator → healer E2E 루프 |
| `scripts/e2e-summary.mjs` | Playwright JSON 리포트를 에이전트가 읽기 쉽게 요약 |

## 참고
- NAVER D2 "AI 에이전트를 위한 Playwright E2E 테스트 하네스 구축하기" (Spec-as-Code, 센서로서의 E2E)
- OpenAI ExecPlans(PLANS.md), Codex `/goal`
- obra/superpowers (MIT): TDD, systematic-debugging, verification-before-completion 스킬만 선택해서 써요.
