# ─────────────────────────────────────────────────────────────────────────
#  publish.ps1
#  ----------------------------------------------------------------------
#  강의 자료를 GitHub 에 푸시 → Vercel 자동 배포 트리거.
#
#  단계:
#    1) `node scripts/build-index.js` 실행 (index.html 카드 재생성)
#    2) 변경 파일 확인 (git status)
#    3) 옵션 -Commit  →  staged + commit
#    4) 옵션 -Push    →  origin 으로 push
#
#  사용 예:
#    pwsh ./scripts/publish.ps1                     # 빌드 + 상태만 확인
#    pwsh ./scripts/publish.ps1 -Commit             # 빌드 + 커밋만
#    pwsh ./scripts/publish.ps1 -Commit -Push       # 풀 파이프라인
#    pwsh ./scripts/publish.ps1 -Commit -Push -Message "feat: add JDBC lecture"
# ─────────────────────────────────────────────────────────────────────────

[CmdletBinding()]
param(
  [switch]$Commit,
  [switch]$Push,
  [string]$Message = "chore: update lecture index"
)

$ErrorActionPreference = "Stop"

# 프로젝트 루트로 이동
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host ""
Write-Host "▶  index.html 재생성" -ForegroundColor Cyan
node scripts/build-index.js
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ build-index.js 실패" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "▶  Git 상태" -ForegroundColor Cyan
$changes = git status --short
if (-not $changes) {
  Write-Host "= 변경 사항 없음. 종료." -ForegroundColor Yellow
  exit 0
}
$changes | ForEach-Object { Write-Host "  $_" }

if (-not $Commit) {
  Write-Host ""
  Write-Host "ℹ  커밋하려면  -Commit  플래그를, 푸시까지 하려면  -Commit -Push  를 추가하세요." -ForegroundColor DarkGray
  exit 0
}

Write-Host ""
Write-Host "▶  스테이징" -ForegroundColor Cyan
# 강의 폴더 + 인덱스 + 스크립트만 add. 실수로 잡다한 파일을 잡지 않도록 화이트리스트 방식.
$paths = @('index.html', 'database', 'frame', 'network', 'thread', 'collection', 'images', 'scripts', 'README.md', 'vercel.json', 'CLAUDE.md')
foreach ($p in $paths) {
  if (Test-Path $p) {
    git add -- $p
  }
}

# 스테이지된 게 있는지 확인
$staged = git diff --cached --name-only
if (-not $staged) {
  Write-Host "= 스테이지된 파일 없음. 종료." -ForegroundColor Yellow
  exit 0
}

Write-Host ""
Write-Host "▶  커밋: $Message" -ForegroundColor Cyan
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  Write-Host "✗ git commit 실패" -ForegroundColor Red
  exit 1
}

if ($Push) {
  Write-Host ""
  Write-Host "▶  origin 으로 Push" -ForegroundColor Cyan
  git push
  if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ git push 실패" -ForegroundColor Red
    exit 1
  }
  Write-Host ""
  Write-Host "✓ 완료. Vercel 이 자동 빌드/배포를 트리거합니다." -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "ℹ  푸시는 수행되지 않았습니다.  필요하면  git push  또는  -Push  플래그 추가." -ForegroundColor DarkGray
}
