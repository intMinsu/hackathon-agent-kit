# hackathon-agent-kit (v2)

이 저장소는 Codex CLI(gpt-6.1-sol)로 시간 제한 해커톤을 진행하기 위한 에이전트 운영 킷이에요. **제품 코드는 들어 있지 않아요.** 운영 계약, 과제 설정 템플릿, E2E 루프 스킬, 실패 요약 스크립트만 있어요.

## 핵심 원칙
- **E2E가 사용자 흐름의 완료 기준이에요.** 기능마다 spec 작성 → 실패(red) → 구현 → 영향받는 검증 → 기록 → 커밋 순서로 진행해요.
- **계산 결과는 독립 검증기로 확인해요.** E2E는 결과값이 맞는지 보장하지 않아요.
- **실제 접속 경로**(미리보기, 프록시, iframe)에서 로그인 → 작업 → 새로고침까지 확인해요. localhost만으로는 부족해요.
- **바뀐 부분에 맞춰 검증해요.** 근거마다 커밋, 입력, 환경을 함께 기록하고 서로 다른 실행의 카운트를 합치지 않아요.
- 현재 상태는 PLANS.md의 Resume 한 곳(`phase` 포함)에만 둬요. 이력은 JOURNAL에 남겨요.

## 빠른 시작

```bash
git clone --depth 1 https://github.com/intMinsu/hackathon-agent-kit .kit
codex -m gpt-6.1-sol -c model_reasoning_effort='"high"' -s workspace-write -c sandbox_workspace_write.network_access=true -a on-request
```

첫 메시지:

```
Run .kit/01-bootstrap-prompt.md. GOAL_FILE=<과제.md> START=13:00 FREEZE=+2h30 DEADLINE=+3h CONTINUE=no
```

이후 진행은 `RUNBOOK.md`를 따라요.

## 파일

| 파일 | 내용 |
|---|---|
| `01-bootstrap-prompt.md` | 0단계 지시: 과제 설정, 사전 점검, 하네스, 계획 |
| `core/AGENTS.template.md` | 운영 계약: 검증 규칙, 병렬 작업, UI 기준, 종료 처리 |
| `templates/TASK_PROFILE.md` | 과제별 설정(sol이 채우고 사람이 확인) |
| `.agents/skills/e2e-loop/SKILL.md` | planner → generator → healer 루프와 변경 종류별 검증 표 |
| `scripts/e2e-summary.mjs` | 보고서 없음, 깨짐, 오래됨, 중단, 미실행, 실패, flaky를 구분하는 요약 |
| `02-goal-command.txt` | `/goal` 문장과, `/goal`이 없을 때 보낼 일반 지시 |
| `03-submission-qa-prompt.md` | 원문의 제출 양식을 따르는 마무리 프롬프트(기본값은 Q1/Q2) |
| `RUNBOOK.md` | 사람용 진행표 |

## 변경 이력
- **v2:**
  - 과제 설정 분리, 독립 검증, 실제 접속 경로 검증, 변경 종류별 검증 표
  - `phase` 상태와 조기 종료 처리, 업무 질문 묶음 전달, 작업자 인수 형식
  - UI 기준, `CONTINUE` 옵션, 정직한 실패 요약
  - 첫 실전 대회 회고를 반영했어요.
- **v1:** E2E 중심 운영 계약, e2e-loop 스킬, 실패 요약 스크립트
