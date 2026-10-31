# 해커톤 운영 런북 (사람용)

에이전트는 gpt-6.1-sol(Codex CLI)이에요. 사람은 방향을 잡고, 구현과 검증은 에이전트가 맡아요.
붙여넣을 프롬프트는 3개예요: `01-bootstrap-prompt.md` → `02-goal-command.txt` → `03-submission-qa-prompt.md`.
모든 프롬프트는 `gpt-6.1-sol`로 미리 감사(이해도·적대적)했고, 0단계 리허설로 검증했어요.

## T-5분: 준비 (세션 시작 전, 셸에서 실행)

```bash
# 1) Superpowers(MIT, v7.0.1)에서 필요한 스킬만 복사
#    brainstorming은 "설계 문서 승인 전에는 아무것도 만들지 않는다"는 게이트가 있어서 제외해요.
git clone --depth 1 https://github.com/obra/superpowers /tmp/superpowers
mkdir -p ~/.agents/skills
for s in test-driven-development systematic-debugging verification-before-completion dispatching-parallel-agents; do
  cp -r /tmp/superpowers/skills/$s ~/.agents/skills/
done

# 2) 환경 확인
node -v && npm -v && git --version && codex --version
```

- 스킬 설치가 실패해도 진행에는 문제가 없어요. 핵심 규칙은 AGENTS.md 템플릿에 이미 들어 있어요.
- 공식 플러그인 경로(TUI에서 `/plugins` → superpowers 설치)를 쓰면 15개 스킬이 모두 설치돼요. 그러면 brainstorming이 자동으로 실행돼 질문을 할 수 있으니, 그때는 "just dive in"이라고 답해서 건너뛰어요.
- **알람을 맞춰 두세요:** 동결 시각(시작 + 3시간 20분)과 종료 10분 전. `/goal`은 시계 기반 타이머가 아니라서, 사람이 `/goal pause`를 눌러야 확실하게 멈춰요.

## T+0: Codex 시작

```bash
codex -m gpt-6.1-sol -c model_reasoning_effort='"high"' \
  -s workspace-write -c sandbox_workspace_write.network_access=true -a on-request
```

- 승인 프롬프트가 시간을 많이 잡아먹고 환경 자체가 일회용 샌드박스라면 `--dangerously-bypass-approvals-and-sandbox`도 고려할 수 있어요. 그 환경에서만 써야 해요.
- 쓸 수 있으면 `/fast`를 켜세요. 2배 속도이고 사용량은 2~2.5배예요.

## T+0~3분: 프롬프트 #1 붙여넣기

킷을 `.kit/`에 clone했다면 README의 한 줄 메시지만 보내면 돼요. clone하지 않았다면 `{{GOAL_FILE}}`, `{{START}}`, `{{FREEZE}}`, `{{DEADLINE}}`를 채운 뒤 통째로 붙여넣어요.
나머지 `{{...}}`(AGENTS.md 템플릿 안)는 에이전트가 채우는 자리라 그대로 둬요.

## T+~30분: 0단계 보고 검토 (5분 이내)

- 필수 기준 → 플로우 → 마일스톤 표가 과제의 채점 포인트와 맞는지 봐요. 틀렸으면 한 줄로 바로잡아요.
- `npm run verify` 카운트가 실제 green인지 확인해요.
- 마일스톤 예산이 동결 시각 전에 끝나고 15분 여유가 있는지 확인해요.

## T+~35분: goal 모드 시작

1. 추론 강도를 **medium**으로 내려요(`/model`).
2. 에이전트가 제안한 `/goal` 문장이나 `02-goal-command.txt`를 붙여넣어요.
- plan 모드에서는 `/goal`이 동작하지 않는다는 보고가 있어요. plan 모드를 썼다면 먼저 빠져나오세요.
- 상태 확인은 `/goal`, 일시정지·재개는 `/goal pause` / `/goal resume`이에요.

## 진행 중 모니터링 (30분마다, 2분 이내)

- `git log --oneline`: 마일스톤마다 커밋이 쌓이는지 봐요.
- `docs/PLANS.md`의 Resume·Progress와 `docs/JOURNAL.md`를 확인해요.
- 방향을 틀 때는 짧고 구체적으로 지시해요. 에이전트가 JOURNAL에 "human intervention"으로 기록하는데, 이게 Q2의 근거가 돼요.
- 같은 실패가 10분 이상 반복되면 범위를 줄이라고 지시해요. 이 규칙은 AGENTS.md에도 들어 있어요.

## 동결 시각: 알람이 울리면

goal이 아직 돌고 있으면 "freeze now: run the freeze checklist"라고 보내요. 그래도 멈추지 않으면 `/goal pause`로 멈추고 다시 지시해요.

## 종료 15분 전: 프롬프트 #3

`03-submission-qa-prompt.md`를 붙여넣어요.
결과로 나온 `docs/SUBMISSION_QA.md`를 직접 읽고 사실과 다른 부분을 고쳐요.

## 추론 강도 (gpt-6.1-sol 자체 권고 + 검토)

| 단계 | 추론 강도 | 이유 |
|---|---|---|
| 0단계 (범위·계획·하네스) | high | 계획 품질이 중요하지만 30분 상한 안에 끝나야 해요 |
| goal 구현 루프 | medium (+fast) | 반복 속도가 가장 중요해요 |
| 핵심 로직 (LLM 파싱·날짜·데이터) | high | 잠깐만 올려요 |
| 막힌 디버깅 | xhigh | 5~10분 한정 |
| Q1/Q2 초안 | medium | 근거 수집 위주예요 |
| **ultra** | **쓰지 않음** | 자동 서브에이전트 위임은 설정·타입·테스트 상태를 공유하는 작은 앱에서 통합 비용만 키워요 |
| max | 쓰지 않음 | 지연 대비 이득이 작아요 |
