# Makes a PDF copy of every .pptx in public\files\presentations (same name, .pdf).
# Needs Microsoft PowerPoint on this computer. Run from the project folder:
#   powershell -ExecutionPolicy Bypass -File scripts\pptx-to-pdf.ps1
# Files that already have an up-to-date PDF are skipped.

$folder = Resolve-Path (Join-Path $PSScriptRoot "..\public\files\presentations")
$ppt = New-Object -ComObject PowerPoint.Application
try {
  Get-ChildItem $folder -Filter *.pptx | ForEach-Object {
    $pdf = [System.IO.Path]::ChangeExtension($_.FullName, ".pdf")
    if ((Test-Path $pdf) -and ((Get-Item $pdf).LastWriteTime -ge $_.LastWriteTime)) {
      Write-Host "skip       $($_.Name)"
      return
    }
    Write-Host "converting $($_.Name)"
    # Open(file, ReadOnly = msoTrue, Untitled = msoFalse, WithWindow = msoFalse)
    $deck = $ppt.Presentations.Open($_.FullName, -1, 0, 0)
    $deck.SaveAs($pdf, 32)   # 32 = save as PDF
    $deck.Close()
  }
}
finally {
  $ppt.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
Write-Host "Done."
