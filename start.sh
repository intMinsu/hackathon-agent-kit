#!/usr/bin/env bash
# One-time setup + launch. Run from the task folder right after cloning:
#   git clone --depth 1 https://github.com/intMinsu/hackathon-agent-kit .kit && bash .kit/start.sh
# Optional args: START PRODUCT_DEADLINE ANSWERS_DEADLINE (KST, HH:MM). Defaults: 19:00 22:00 23:00.
# Env overrides: SPEC=README.md  NO_SEARCH=1  PERM="--dangerously-bypass-approvals-and-sandbox"  NO_LAUNCH=1
set -euo pipefail
cd "$(dirname "$0")/.."

START="${1:-19:00}"; DEADLINE="${2:-22:00}"; ANSWERS="${3:-23:00}"
SPEC="${SPEC:-README.md}"
to_min() { IFS=: read -r h m <<<"$1"; echo $((10#$h * 60 + 10#$m)); }
f=$(( $(to_min "$DEADLINE") - 30 )); FREEZE=$(printf "%02d:%02d" $((f / 60)) $((f % 60)))

[ -f "$SPEC" ] || echo "WARNING: spec file '$SPEC' not found here (set SPEC=<file>)."

# Role agents (project scope, falling back to user scope).
if mkdir -p .codex/agents 2>/dev/null && cp .kit/agents/*.toml .codex/agents/ 2>/dev/null; then
  echo "roles -> .codex/agents/"
elif mkdir -p "${CODEX_HOME:-$HOME/.codex}/agents" && cp .kit/agents/*.toml "${CODEX_HOME:-$HOME/.codex}/agents/"; then
  echo "roles -> ${CODEX_HOME:-$HOME/.codex}/agents/"
else
  echo "WARNING: could not install role agents; Main will spawn generic agents with the role instructions."
fi

# Root AGENTS.md bootstrap (auto-loaded by Codex at session start). Never touches the spec.
rendered=$(sed -e "s/{{SPEC}}/$SPEC/g" -e "s/{{START}}/$START/g" -e "s/{{FREEZE}}/$FREEZE/g" \
  -e "s/{{DEADLINE}}/$DEADLINE/g" -e "s/{{ANSWERS}}/$ANSWERS/g" .kit/bootstrap/AGENTS.md)
if [ "$SPEC" = "AGENTS.md" ]; then
  echo "ERROR: the spec is AGENTS.md; refusing to touch it."; exit 1
elif [ ! -f AGENTS.md ]; then
  printf '%s\n' "$rendered" > AGENTS.md; echo "AGENTS.md bootstrap written"
elif ! grep -q "hackathon-agent-kit bootstrap" AGENTS.md; then
  printf '\n%s\n' "$rendered" >> AGENTS.md; echo "AGENTS.md: bootstrap appended to the existing file"
fi

# Keep the kit out of the product repo without editing tracked files.
[ -d .git ] && { grep -qx ".kit/" .git/info/exclude 2>/dev/null || echo ".kit/" >> .git/info/exclude; }

echo "Event (KST): start $START | freeze $FREEZE | product deadline $DEADLINE | answers deadline $ANSWERS | spec $SPEC (read-only)"
echo "Next: in Codex type /fast, then send:  /goal Follow AGENTS.md   (if /goal is unavailable, send: start)"
[ -n "${NO_LAUNCH:-}" ] && exit 0

args=(-m gpt-6.1-sol -c 'model_reasoning_effort="xhigh"')
[ -z "${NO_SEARCH:-}" ] && args+=(--search)
if [ -n "${PERM:-}" ]; then
  args+=($PERM)
else
  args+=(-s workspace-write -c 'sandbox_workspace_write.network_access=true' -a on-request)
fi
exec codex "${args[@]}"
