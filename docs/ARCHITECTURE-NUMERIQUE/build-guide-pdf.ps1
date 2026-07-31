# Regénère le PDF du guide architecture (sans TOC Pandoc auto — sommaire manuel dans le MD)
$pandoc = "C:\Users\AAA\AppData\Local\Microsoft\WinGet\Packages\JohnMacFarlane.Pandoc_Microsoft.Winget.Source_8wekyb3d8bbwe\pandoc-3.10\pandoc.exe"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir

& $pandoc GUIDE-ARCHITECTURE-NUMERIQUE.md -o GUIDE-ARCHITECTURE-NUMERIQUE.html `
  --standalone --css=pdf-export.css

$html = (Resolve-Path "GUIDE-ARCHITECTURE-NUMERIQUE.html").Path -replace '\\','/'
$pdf = Join-Path $dir "GUIDE-ARCHITECTURE-NUMERIQUE.pdf"
Remove-Item $pdf -Force -ErrorAction SilentlyContinue

& "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --disable-gpu --no-pdf-header-footer `
  --virtual-time-budget=20000 --print-to-pdf="$pdf" "file:///$html"

Start-Sleep -Seconds 2
Get-Item $pdf | Format-List Name, Length, LastWriteTime
