# 해커톤 운영 런북 (사람용, v2.1)

에이전트는 gpt-6.1-sol(Codex CLI)이에요. 사람은 방향을 잡고, sol 팀이 만들고 검증해요.
- 팀 구성: Main + researcher + web + qa
- 3시간·4시간 행사 모두 같은 킷을 써요.

## T-5분: 준비

```bash
git clone --depth 1 https://github.com/intMinsu/hackathon-agent-kit .kit
mkdir -p .codex/agents && cp .kit/agents/*.toml .codex/agents/   # 역할별 추론 강도와 지침
codex -m gpt-6.1-sol -c model_reasoning_effort='"xhigh"' --search \
  -s workspace-write -c sandbox_workspace_write.network_access=true -a on-request
```

- `.codex/`에 쓸 수 없는 환경이면 `~/.codex/agents/`에 복사해요. 그것도 안 되면 그냥 건너뛰어요. Main이 역할 지침을 직접 전달해서 실행해요.
- `--search`(웹 검색)가 막혀 있으면 빼고 실행해요. 이 경우 researcher는 킷에 들어 있는 문제 유형 표로 해법을 찾아요.
- 쓸 수 있으면 `/fast`를 켜세요. 추론 강도를 낮추는 것보다 효과가 커요.
- 서브에이전트 수 상한에 걸리면 실행 명령에 `-c agents.max_concurrent_threads_per_session=4`를 추가해요.
- **알람 2개:** 동결 시각, 마감 10분 전.

## T+0: 시작 (한 줄)

`.kit/02-goal-command.txt`의 **A줄**에 과제 파일과 시각만 채워서 보내요.

```
/goal Run .kit/01-bootstrap-prompt.md with GOAL_FILE=<과제.md> START=13:00 FREEZE=+2h30 DEADLINE=+3h, then build per AGENTS.md until the freeze checklist is done. ...
```

`/goal`이 없으면 **B줄**을 보내요: `Run .kit/01-bootstrap-prompt.md. GOAL_FILE=<과제.md> START=13:00 FREEZE=+2h30 DEADLINE=+3h CONTINUE=yes`

## 진행 흐름

| 시점 | sol 팀 | 사람 |
|---|---|---|
| 0~5분 | Main: TASK_PROFILE 작성 → **researcher 투입** | |
| 5~10분 | Main: 업무 질문을 한 번에 보냄(최대 3개) | 짧게 답해요(선택) |
| 5~30분(DB·로그인 있으면 40분) | Main: 사전 점검 → 하네스 → DB·로그인 → CONTRACTS 작성 → M0 커밋 → 보고 / researcher: 해법 브리프 작성 | |
| 30분~ | **qa·web 투입** → 마일스톤 루프를 병렬로 진행. 전체 verify는 QA만 돌려요 | 보고를 읽고(비동기) 틀린 것만 지시해요 |
| 30분마다 | | `git log`, Resume 확인. **실제 미리보기 URL에서 직접 핵심 작업을 한 번 해 봐요** |
| 동결 | 동결 체크리스트 진행 | "freeze now: set phase frozen and run the freeze checklist" |
| 마감 15분 전 | 제출 문서 작성 | `Run .kit/03-submission-qa-prompt.md` → 결과를 직접 읽고 사실과 다른 곳 수정 → **제출 접수를 주최 측 화면에서 직접 확인** |

- `/goal pause`는 검증까지 포함해 모든 작업을 멈출 때만 써요.
- 조기 종료 통보를 받으면 "event ended at <시각>, source: <출처>"를 보내요. sol이 `phase: ended`로 바꾸고 멈춰요.

## 추론 강도 (역할 파일에 들어 있어요)

| 역할 | 강도 | 이유 |
|---|---|---|
| Main | xhigh | 계약과 통합을 맡아요. 모든 흐름이 Main을 거쳐서, max의 지연이 그대로 전체 지연이 돼요 |
| researcher | max | 가장 어려운 추론이고 초반에 몰려 있어요 |
| web | high | 계약이 정해진 구현이에요 |
| qa | high | 불변 조건은 researcher가 max로 정의해 두고, qa는 구현하고 실행해요 |
| 막힌 디버깅 | xhigh로 잠깐 올려요 | |
