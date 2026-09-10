# 상단 메뉴 통일 — 모든 페이지의 메뉴를 아래 6개로 똑같이 맞춘다
#
#   powershell -ExecutionPolicy Bypass -File _content\메뉴통일.ps1
#
# 고정 메뉴:  지역 찾기 · 포스기·카드단말기 · 무인자판기 · 비교 가이드 · 지역별 견적 · 설치 후기
#
# 페이지 위치에 따라 경로만 달라진다(루트면 그대로, 하위 폴더면 ../).
# 자기 폴더를 가리키는 항목은 ./ 로 넣는다.
# 데스크톱 메뉴(.nav)와 모바일 메뉴(#mnav) 둘 다 바꾼다. 모바일에는 끝에 "견적 받기"를 붙인다.
#
# ⚠️ 지역 페이지는 생성기(지역페이지생성.ps1)로도 만들어지므로, 생성기 템플릿의 메뉴도 같이 맞춰야 한다.

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot

# 메뉴 정의: 표시이름 / 루트 기준 경로 / 이 항목이 "현재 위치"가 되는 폴더
$MENU = @(
  @{ label="지역 찾기";        root="#regions";          own=$null },
  @{ label="포스기·카드단말기"; root="#catalog-pos";      own=$null },
  @{ label="무인자판기";        root="#catalog-vending";  own=$null },
  @{ label="비교 가이드";       root="compare/";          own="compare" },
  @{ label="지역별 견적";       root="region/";           own="region" },
  @{ label="설치 후기";         root="review/";           own="review" }
)

function Build-Nav([string]$folder, [string]$indent, [string]$kind) {
  # $kind: desktop | mobile | footer
  $prefix = if ($folder) { "../" } else { "" }
  $lines = foreach ($m in $MENU) {
    $href = if ($m.own -and $m.own -eq $folder) { "./" } else { "$prefix$($m.root)" }
    "$indent<a href=`"$href`">$($m.label)</a>"
  }
  $q = if ($folder) { "../#quote" } else { "#quote" }
  if ($kind -eq "mobile") { $lines += "$indent<a href=`"$q`" class=`"mnav-cta`">견적 받기</a>" }
  if ($kind -eq "footer") { $lines += "$indent<a href=`"$q`">견적 신청</a>" }
  return ($lines -join "`n")
}

$files = @()
$files += Get-ChildItem $repo -Filter "index.html" -File
foreach ($sub in @("compare","region","review")) {
  $p = Join-Path $repo $sub
  if (Test-Path $p) { $files += Get-ChildItem $p -Filter "*.html" -File }
}

$changed = 0; $skipped = 0
foreach ($f in $files) {
  $folder = ""
  $parent = Split-Path $f.DirectoryName -Leaf
  if ($parent -in @("compare","region","review")) { $folder = $parent }

  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.UTF8Encoding]::new($false))

  # 리다이렉트 전용 페이지처럼 메뉴가 없는 파일은 건너뛴다
  if ($html -notmatch '<nav class="nav" aria-label="주요 메뉴">') { $skipped++; continue }

  $deskNav = Build-Nav $folder "      " "desktop"
  $mobNav  = Build-Nav $folder "    "   "mobile"
  $footNav = Build-Nav $folder "      " "footer"

  $html = [regex]::Replace($html,
    '(?s)(<nav class="nav" aria-label="주요 메뉴">).*?(\r?\n\s*</nav>)',
    { param($m) $m.Groups[1].Value + "`n" + $deskNav + $m.Groups[2].Value })

  $html = [regex]::Replace($html,
    '(?s)(<div class="mnav" id="mnav">).*?(\r?\n\s*</div>)',
    { param($m) $m.Groups[1].Value + "`n" + $mobNav + $m.Groups[2].Value })

  $html = [regex]::Replace($html,
    '(?s)(<nav class="foot-nav" aria-label="바닥 메뉴">).*?(\r?\n\s*</nav>)',
    { param($m) $m.Groups[1].Value + "`n" + $footNav + $m.Groups[2].Value })

  [System.IO.File]::WriteAllText($f.FullName, $html, [System.Text.UTF8Encoding]::new($false))
  $changed++
}

Write-Output "메뉴 통일: ${changed}개 / 메뉴 없어 건너뜀 ${skipped}개"
