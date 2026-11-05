# 해커톤 운영 런북 (사람용, v2)

에이전트는 gpt-6.1-sol(Codex CLI)이에요. 사람은 방향을 잡고, sol이 만들고 검증해요. 3시간·4시간 행사 모두 같은 킷을 써요. 행사마다 다른 시간, 제출 양식, 환경은 sol이 `TASK_PROFILE`에 채워요.

## T-5분: 준비

```bash
git clone --depth 1 https://github.com/intMinsu/hackathon-agent-kit .kit
codex -m gpt-6.1-sol -c model_reasoning_effort='"high"' \
  -s workspace-write -c sandbox_workspace_write.network_access=true -a on-request
```

- **알람 2개:** 동결 시각, 마감 10분 전.
- 쓸 수 있으면 `/fast`를 켜세요.
- 대회 환경이 권한이나 모델을 정해 두었다면 그 설정이 우선이에요.

## T+0: 시작 메시지

```
Run .kit/01-bootstrap-prompt.md. GOAL_FILE=<과제.md> START=13:00 FREEZE=+2h30 DEADLINE=+3h CONTINUE=no
```

- 시간은 행사에 맞게 바꿔요. 4시간이면 `FREEZE=+3h20 DEADLINE=+4h`예요.
- 0단계에서 멈추지 않고 바로 이어가게 하려면 `CONTINUE=yes`를 넣어요.

## T+0~10분: sol이 보내는 업무 질문

설계가 바뀌는 질문이 최대 3개, 한 번에 와요. 답할 수 있으면 짧게 답해요. 답을 기다리는 동안 sol은 가정을 기록하고 다른 작업을 계속해요.

## T+~30분: 0단계 보고 검토 (5분 이내)

- `docs/TASK_PROFILE.md`: DB, 로그인, 컨테이너, 실제 접속 URL, 제출 양식이 원문과 맞는지
- 필수 기준 → 근거(E2E / 독립 검증) → 마일스톤 표
- verify 카운트와 **실제 접속 경로**에서 동작하는지
- 계산형 과제라면 독립 검증 불변 조건 목록

## 구현 시작

`CONTINUE=no`였다면 이렇게 해요.
1. 같은 세션에서 계속해요. 새 세션을 열면 실행 중인 서브에이전트가 끊길 수 있어요. 지시가 흐려졌을 때만 재시작해요.
2. 필요하면 `/model`에서 추론 강도를 조정해요.
3. `.kit/02-goal-command.txt`의 `/goal` 줄을 붙여넣어요. `/goal`을 쓸 수 없으면 같은 파일의 일반 지시를 보내요.

## 진행 중 (30분마다, 2분 이내)

- `git log --oneline`과 `docs/PLANS.md`의 Resume(20줄 이내)을 확인해요.
- **직접 실제 미리보기 URL로 들어가서 핵심 작업 하나를 해 봐요.** 이번 대회에서 로그인 문제를 사람이 먼저 발견했어요.
- 방향을 틀 때는 짧게 지시해요. sol이 JOURNAL에 "human intervention"으로 기록하고, 이게 Q2의 근거가 돼요.
- 같은 실패로 10분 넘게 헤매면 범위를 줄이라고 지시해요.

## 동결 알람

"freeze now: set phase frozen and run the freeze checklist"를 보내요. `/goal pause`는 검증까지 포함해 모든 작업을 멈출 때만 써요.

## 마감 15분 전

`Run .kit/03-submission-qa-prompt.md`를 보낸 뒤 결과를 직접 읽고 사실과 다른 부분을 고쳐요. **제출 접수는 주최 측 화면에서 직접 확인해요.**

## 조기 종료 통보를 받으면

"event ended at <시각>, source: <출처>"를 보내요. sol이 `phase: ended`로 바꾸고 작업을 멈춰요. 재접속해도 구현을 재개하지 않아요.

## 추론 강도

| 단계 | 강도 |
|---|---|
| 0단계 | high |
| 구현 루프 | medium (+fast) |
| 계산·데이터·인증 핵심 로직 | high (잠깐) |
| 막힌 디버깅 | xhigh (5~10분 한정) |
| ultra / max | 쓰지 않음 |
