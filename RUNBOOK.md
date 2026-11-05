# 해커톤 운영 런북 (사람용, v2.1)

에이전트 팀은 gpt-6.1-sol이에요: Main(xhigh) + researcher(max) + web(high) + qa(high).
기본 일정(KST)은 19:00 시작, 21:30 동결, **22:00 제품 마감**, **23:00 서술형 답안 마감**이에요.

## 1. 세팅: 과제 폴더(README.md가 있는 곳)에서 한 번

```bash
git clone --depth 1 https://github.com/intMinsu/hackathon-agent-kit .kit && bash .kit/start.sh
```

`start.sh`가 하는 일:
- 역할 에이전트 3종을 `.codex/agents/`에 설치해요.
- **루트 `AGENTS.md`를 생성해요.** 시각, 과제 원문(읽기 전용), 첫 행동이 들어 있고, Codex가 세션을 시작할 때 자동으로 읽어요.
- `.kit/`을 git에서 제외해요.
- codex를 정해진 옵션으로 실행해요: `gpt-6.1-sol`, xhigh, 웹 검색, workspace-write에 네트워크 허용.

**README.md는 절대 수정하지 않아요.**

옵션:
- 시각이 다르면: `bash .kit/start.sh 19:00 22:00 23:00`
- 과제 파일 이름이 다르면: `SPEC=TASK.md bash .kit/start.sh`
- 웹 검색이 막혀 있으면: `NO_SEARCH=1`
- 환경이 일회용 샌드박스라 승인 절차를 생략하려면: `PERM="--dangerously-bypass-approvals-and-sandbox"`
- Windows에서는: `powershell -ExecutionPolicy Bypass -File .kit\start.ps1`

## 2. Codex가 열리면 (입력 2번)

```
/fast
/goal Follow AGENTS.md
```

- `/goal`을 쓸 수 없으면 `start`만 보내요. 어떤 메시지든 AGENTS.md가 0단계를 시작하게 해요.
- 그다음은 세션이 스스로 진행해요:
  - README를 `docs/TASK_SPEC.md`로 복사
  - 과제 설정 작성
  - researcher 투입
  - 사전 점검 → 하네스 → 계약 → M0
  - qa·web 투입 → 마일스톤 루프

## 3. 진행 중 (사람)

| 시점 | 할 일 |
|---|---|
| ~19:07 | sol이 페르소나에게 보낼 업무 질문(최대 3개, 한국어)을 줘요. IDE의 담당자 에이전트에 붙여넣고, 답을 `persona: ...`로 전달해요. 그동안 sol은 가정을 세우고 계속 진행해요 |
| ~19:40 | 0단계 보고를 읽어요. 필수 기준, DB·로그인, 실제 접속 URL이 맞는지 보고 틀린 것만 한 줄로 바로잡아요 |
| 30분마다 | `git log --oneline`과 `docs/PLANS.md`의 Resume를 확인하고, **실제 미리보기에서 핵심 작업을 한 번** 해 봐요 |
| 수시 | sol이 **페르소나(인사팀 등)에게 보낼 질문**을 주면 IDE의 담당자 에이전트에 그대로 붙여넣어요. 답이 오면 `persona: <답변>`으로 sol에게 전달해요 |
| 21:30 알람 | `freeze now`를 보내요. sol이 동결 체크리스트를 진행하고 **`docs/ANSWER_PREP.md`**를 써요. 내용은 예상 질문 8~10개, 질문별 답안 뼈대, 실제 사례(에이전트 문제 → 수정), 핵심 수치표예요 |
| 21:40~22:00 | **ANSWER_PREP을 같이 검토해요.** sol에게 "이 사례 근거 더 구체적으로" 같은 보완을 요청해도 돼요. 22:00 전까지만이에요 |
| 22:00 | sol은 완전히 멈춰요(ended). **이후 서술형 6문제는 AI 없이 혼자** 써요 |
| ~22:55 | 제출하고, **접수 여부는 주최 측 화면에서 직접 확인**해요 |

- 조기 종료 통보를 받으면 `event ended at <시각>, source: <출처>`를 보내요.
- `/goal pause`는 검증까지 포함해 모든 작업을 멈출 때만 써요.

## 추론 강도 (역할 파일과 start.sh에 고정)

| 역할 | 강도 |
|---|---|
| Main | xhigh |
| researcher | max |
| web | high |
| qa | high |
