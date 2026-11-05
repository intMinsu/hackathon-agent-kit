# hackathon-agent-kit (v2.1)

이 저장소는 Codex CLI(gpt-6.1-sol)로 시간 제한 해커톤을 진행하기 위한 에이전트 운영 킷이에요. **제품 코드는 들어 있지 않아요.** 운영 계약, 역할 에이전트, 과제 설정 템플릿, E2E 루프 스킬, 테스트 실행·요약 스크립트만 있어요.

## 핵심 원칙
- **팀:** Main(xhigh) + researcher(max) + web(high) + qa(high)
  - researcher는 0단계 5분 차에 투입돼서 해법을 탐색해요.
  - Main은 계약(`CONTRACTS.md`)을 먼저 확정하고, 그다음 병렬 작업이 시작돼요.
  - QA가 검증을 전부 맡아요. 만드는 에이전트와 검증하는 에이전트를 분리하기 위해서예요.
- **E2E가 사용자 흐름의 완료 기준이에요.** 계산 결과는 E2E만으로 보장되지 않아서, 구현 코드를 쓰지 않는 **독립 검증기**로 따로 확인해요.
- **실제 접속 경로**(플랫폼 iframe, HTTPS 프록시)에서 역할마다 로그인 → 작업 → 새로고침 → 로그아웃까지 확인해요.
- **바뀐 부분에 맞춰 검증해요.** 근거마다 범위, 커밋, 입력을 기록하고 서로 다른 실행의 카운트는 합치지 않아요.
- 현재 상태는 PLANS.md의 Resume 한 곳(`phase` 포함)에만 둬요. 이력은 JOURNAL에 남겨요.

## 빠른 시작

```bash
git clone --depth 1 https://github.com/intMinsu/hackathon-agent-kit .kit
mkdir -p .codex/agents && cp .kit/agents/*.toml .codex/agents/
codex -m gpt-6.1-sol -c model_reasoning_effort='"xhigh"' --search -s workspace-write -c sandbox_workspace_write.network_access=true -a on-request
```

첫 메시지(`/goal` 한 줄):

```
/goal Run .kit/01-bootstrap-prompt.md with GOAL_FILE=<과제.md> START=13:00 FREEZE=+2h30 DEADLINE=+3h, then build per AGENTS.md until the freeze checklist is done. After any compaction, re-read AGENTS.md and the PLANS.md Resume first. QA alone runs full verify. At FREEZE set phase frozen; on end, set phase ended and stop.
```

`/goal`을 쓸 수 없는 경우의 대안은 `02-goal-command.txt`에 있어요. 진행 순서는 `RUNBOOK.md`를 따라요.

## 파일

| 파일 | 내용 |
|---|---|
| `01-bootstrap-prompt.md` | 0단계 지시: 과제 설정, researcher 조기 투입, 사전 점검, 하네스, 계약, 계획 |
| `core/AGENTS.template.md` | 운영 계약: 팀과 소유권, 검증 규칙, 실제 접속 경로, 종료 처리 |
| `agents/researcher.toml` | 해법 탐색 → `SOLUTION_BRIEF.md` → 솔버 구현. 문제 유형별 baseline·표준 해법·라이선스 표 포함 |
| `agents/web.toml` | 계약 기반 화면 구현과 UI 기준 |
| `agents/qa.toml` | E2E spec, 독립 검증기, 전체 verify, 실제 접속 경로 점검 |
| `templates/TASK_PROFILE.md` | 과제별 설정(sol이 채우고 사람이 확인) |
| `.agents/skills/e2e-loop/SKILL.md` | planner → generator → healer 루프와 변경 종류별 검증 표 |
| `scripts/run-e2e.mjs` | 이전 보고서를 지우고 Playwright를 실행한 뒤 요약을 출력해요. `--reporter` 옵션은 거부해요 |
| `scripts/e2e-summary.mjs` | 보고서의 결과를 분류해요(통과, 실패, flaky, 중단, 미실행, skip, runner 오류). 보고서가 현재 코드와 일치하는지는 따로 확인해야 해요 |
| `02-goal-command.txt` | 시작용 `/goal`, `/goal`이 없을 때의 대안, 재개 지시 |
| `03-submission-qa-prompt.md` | 원문의 제출 양식을 따르는 마무리 프롬프트(기본값은 Q1/Q2) |
| `RUNBOOK.md` | 사람용 진행표 |

## 변경 이력
- **v2.1:**
  - 역할 에이전트 3종과 역할별 추론 강도
  - researcher 조기 투입, 계약 먼저 확정
  - QA가 verify를 소유
  - `CONTINUE=yes` 기본값, `/goal` 한 줄로 시작
- **v2:**
  - 과제 설정 분리, 독립 검증, 실제 접속 경로 검증, 변경 종류별 검증 표
  - `phase` 상태와 조기 종료 처리, `run-e2e` 래퍼, Playwright JSON 결과 해석 수정
  - 첫 실전 대회 회고와 sol 감사를 반영했어요.
- **v1:** E2E 중심 운영 계약, e2e-loop 스킬, 실패 요약 스크립트
