# Windows equivalent of start.sh. Run from the task folder:
#   git clone --depth 1 https://github.com/intMinsu/hackathon-agent-kit .kit; powershell -ExecutionPolicy Bypass -File .kit\start.ps1
param([string]$Start = "19:00", [string]$Deadline = "22:00", [string]$Answers = "23:00", [string]$Spec = "README.md", [switch]$NoSearch, [switch]$NoLaunch)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
$freeze = ([datetime]::ParseExact($Deadline, "HH:mm", $null)).AddMinutes(-30).ToString("HH:mm")
if (-not (Test-Path $Spec)) { Write-Warning "spec file '$Spec' not found here (use -Spec <file>)." }

try { New-Item -ItemType Directory -Force .codex\agents | Out-Null; Copy-Item .kit\agents\*.toml .codex\agents\ -Force; "roles -> .codex\agents\" }
catch { Write-Warning "could not install role agents; Main will spawn generic agents with the role instructions." }

if ($Spec -eq "AGENTS.md") { throw "the spec is AGENTS.md; refusing to touch it." }
$rendered = (Get-Content -Raw .kit\bootstrap\AGENTS.md).Replace("{{SPEC}}", $Spec).Replace("{{START}}", $Start).Replace("{{FREEZE}}", $freeze).Replace("{{DEADLINE}}", $Deadline).Replace("{{ANSWERS}}", $Answers)
if (-not (Test-Path AGENTS.md)) { Set-Content -NoNewline -Encoding utf8 AGENTS.md $rendered; "AGENTS.md bootstrap written" }
elseif (-not (Select-String -Quiet "hackathon-agent-kit bootstrap" AGENTS.md)) { Add-Content -Encoding utf8 AGENTS.md "`n$rendered"; "AGENTS.md: bootstrap appended" }

if ((Test-Path .git) -and -not (Select-String -Quiet -SimpleMatch ".kit/" .git\info\exclude -ErrorAction SilentlyContinue)) { Add-Content .git\info\exclude ".kit/" }

"Event (KST): start $Start | freeze $freeze | product deadline $Deadline | answers deadline $Answers | spec $Spec (read-only)"
"Next: in Codex type /fast, then send:  /goal Follow AGENTS.md   (if /goal is unavailable, send: start)"
if ($NoLaunch) { return }
$codexArgs = @("-m", "gpt-6.1-sol", "-c", 'model_reasoning_effort="xhigh"')
if (-not $NoSearch) { $codexArgs += "--search" }
$codexArgs += @("-s", "workspace-write", "-c", "sandbox_workspace_write.network_access=true", "-a", "on-request")
& codex @codexArgs
