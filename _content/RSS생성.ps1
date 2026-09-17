# RSS생성.ps1 — 픽포스 RSS 생성기
#   review/*.html(설치 후기) + compare/*.html(비교 가이드) 를 읽어 루트 rss.xml 을 만든다 (최신 100건).
#   글을 올린 뒤 실행하고 rss.xml 을 함께 커밋한다. 재실행 안전.
#   실행: powershell -NoProfile -ExecutionPolicy Bypass -File _content\RSS생성.ps1
#   ※ UTF-8 BOM 으로 저장 (PowerShell 5.1 은 .ps1 을 ANSI 로 읽어 한글이 깨진다)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$BASE = 'https://hsupporter.com'
$MAX  = 50    # 본문 전체를 넣으므로 파일이 커진다. 최신 50건만.
$enc  = New-Object System.Text.UTF8Encoding($false)
function X($s) { return ("$s" -replace '&(?!amp;|lt;|gt;|quot;|#)', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;') }

# 네이버 가이드 5번: "최신글은 본문 전체를 포함하여 RSS 피드에 담아주세요" (2026-09-17 추가)
# 글 페이지의 <article class="art"> 안쪽 HTML 을 꺼내, 상대 주소(../ ./ 파일명)를 절대 주소로 바꾼다.
function Get-Body([string]$html, [string]$dir) {
  $m = [regex]::Match($html, '(?s)<article class="art">(.*?)</article>')
  if (-not $m.Success) { return '' }
  $b = $m.Groups[1].Value
  $b = [regex]::Replace($b, '(?s)<script\b.*?</script>', '')
  $b = [regex]::Replace($b, '(href|src)="([^"]*)"', {
    param($mm)
    $attr = $mm.Groups[1].Value; $v = $mm.Groups[2].Value
    if ($v -match '^(https?:|tel:|sms:|mailto:|#|data:)') { $abs = $v }
    elseif ($v.StartsWith('../')) { $abs = "$BASE/" + $v.Substring(3) }
    elseif ($v.StartsWith('./'))  { $abs = "$BASE/$dir/" + $v.Substring(2) }
    elseif ($v -eq '')            { $abs = "$BASE/$dir/" }
    else                          { $abs = "$BASE/$dir/$v" }
    return "$attr=`"$abs`""
  })
  $b = ($b -replace '\r?\n\s*\r?\n', "`n").Trim()
  return ($b -replace '\]\]>', ']]]]><![CDATA[>')   # CDATA 안전 처리
}

$items = New-Object System.Collections.ArrayList
foreach ($spec in @(@{ dir = 'review'; cat = '설치 후기' }, @{ dir = 'compare'; cat = '비교 가이드' })) {
  $dir = Join-Path $root $spec.dir
  if (-not (Test-Path $dir)) { continue }
  foreach ($f in Get-ChildItem (Join-Path $dir '*.html')) {
    if ($f.Name -eq 'index.html') { continue }
    $t = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
    $title = [regex]::Match($t, '<title>([^<]*)</title>').Groups[1].Value -replace '\s*\|\s*픽포스\s*$', ''
    $desc  = [regex]::Match($t, '<meta name="description" content="([^"]*)"').Groups[1].Value
    $dm    = [regex]::Match($t, '"datePublished":\s*"(\d{4})-(\d{2})-(\d{2})')
    if (-not $dm.Success) { $dm = [regex]::Match($f.Name, '^(\d{4})-(\d{2})-(\d{2})') }
    if (-not $title -or -not $dm.Success) { continue }
    $dt = Get-Date -Year ([int]$dm.Groups[1].Value) -Month ([int]$dm.Groups[2].Value) -Day ([int]$dm.Groups[3].Value) -Hour 10 -Minute 0 -Second 0
    $body = Get-Body $t $spec.dir
    [void]$items.Add([pscustomobject]@{ url = "$BASE/$($spec.dir)/$($f.Name)"; title = $title.Trim(); desc = $desc; body = $body; cat = $spec.cat; date = $dt })
  }
}
$items = $items | Sort-Object date -Descending | Select-Object -First $MAX
if (-not $items) { throw '후기·비교 글을 하나도 읽지 못했습니다.' }

$ci = [Globalization.CultureInfo]::InvariantCulture
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>')
[void]$sb.AppendLine('<title>픽포스 — 무인자판기·포스기 설치 후기와 비교 가이드</title>')
[void]$sb.AppendLine("<link>$BASE/</link>")
[void]$sb.AppendLine('<description>픽포스가 설치한 무인자판기·포스기·카드단말기·키오스크 현장 후기와 구입 vs 렌탈 비교 가이드</description>')
[void]$sb.AppendLine('<language>ko</language>')
[void]$sb.AppendLine("<atom:link href=`"$BASE/rss.xml`" rel=`"self`" type=`"application/rss+xml`" />")
[void]$sb.AppendLine("<lastBuildDate>$((Get-Date).ToString('ddd, dd MMM yyyy HH:mm:ss', $ci)) +0900</lastBuildDate>")
foreach ($it in $items) {
  [void]$sb.AppendLine('<item>')
  [void]$sb.AppendLine("<title>$(X $it.title)</title>")
  [void]$sb.AppendLine("<link>$(X $it.url)</link>")
  [void]$sb.AppendLine("<guid isPermaLink=`"true`">$(X $it.url)</guid>")
  [void]$sb.AppendLine("<category>$(X $it.cat)</category>")
  # description = 본문 전체 HTML (네이버는 description 을 본문으로 읽는다). 요약은 맨 앞 문단으로 남긴다.
  if ($it.body) {
    [void]$sb.AppendLine("<description><![CDATA[<p>$($it.desc -replace '\]\]>', '')</p>`n$($it.body)]]></description>")
    [void]$sb.AppendLine("<content:encoded><![CDATA[$($it.body)]]></content:encoded>")
  } else {
    [void]$sb.AppendLine("<description>$(X $it.desc)</description>")
  }
  [void]$sb.AppendLine("<pubDate>$($it.date.ToString('ddd, dd MMM yyyy HH:mm:ss', $ci)) +0900</pubDate>")
  [void]$sb.AppendLine('</item>')
}
[void]$sb.AppendLine('</channel></rss>')
[IO.File]::WriteAllText((Join-Path $root 'rss.xml'), $sb.ToString(), $enc)
Write-Host "rss.xml 생성: $(@($items).Count)건 (최신: $($items[0].title))"
