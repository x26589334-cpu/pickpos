# 설치 후기용 사진 축소 스크립트
# 원본(2~5MB, 4000px)을 웹용(가로 1200px, JPEG 82%)으로 줄여 photos/review/ 에 저장한다.
#
# 사용법:
#   powershell -ExecutionPolicy Bypass -File _content\사진줄이기.ps1 -Src "원본경로.jpg" -Out "2026-09-10-pyeongtaek.jpg"
#
# 세로 사진이면 세로 1200px 기준으로 맞춘다(긴 변 1200).

param(
  [Parameter(Mandatory=$true)][string]$Src,
  [Parameter(Mandatory=$true)][string]$Out,
  [int]$Max = 1200,
  [int]$Quality = 82
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $Src)) { Write-Error "원본을 찾을 수 없습니다: $Src"; exit 1 }

$repo    = Split-Path -Parent $PSScriptRoot
$destDir = Join-Path $repo "photos\review"
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force $destDir | Out-Null }
$destPath = Join-Path $destDir $Out

$img = [System.Drawing.Image]::FromFile((Resolve-Path $Src))
try {
  # ⚠️ EXIF 회전 정보를 먼저 적용한다.
  # 폰으로 찍은 사진은 세로로 찍어도 파일은 가로로 저장되고, "EXIF 회전값"에 방향이 따로 적힌다.
  # 이걸 무시하면 사진이 눕거나 뒤집힌 채로 저장된다 (2026-09-10 평택 글에서 실제로 발생).
  if ($img.PropertyIdList -contains 0x0112) {
    switch ($img.GetPropertyItem(0x0112).Value[0]) {
      2 { $img.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX) }
      3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
      4 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipX) }
      5 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipX) }
      6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
      7 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipX) }
      8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
    }
  }

  # 긴 변을 $Max 로 맞춘다 (원본이 더 작으면 그대로)
  $ratio = [Math]::Min(1.0, $Max / [Math]::Max($img.Width, $img.Height))
  $w = [int][Math]::Round($img.Width  * $ratio)
  $h = [int][Math]::Round($img.Height * $ratio)

  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g   = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)
  $g.Dispose()

  $codec  = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
  $bmp.Save($destPath, $codec, $params)
  $bmp.Dispose()
}
finally { $img.Dispose() }

$kb = [int]((Get-Item $destPath).Length / 1KB)
Write-Output "저장: photos/review/$Out  ($w x $h, ${kb}KB)"
