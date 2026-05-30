$ErrorActionPreference = "Stop"
$db = Join-Path (Split-Path -Parent $PSScriptRoot) "prisma\dev.db"
if (-not (Test-Path $db)) { Write-Error "No existe prisma/dev.db" }
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($db))
$b64 | Set-Clipboard
Write-Host "Base64 de dev.db copiado al portapapeles ($($b64.Length) chars)."
Write-Host "En Railway Shell ejecuta:"
Write-Host '  echo "PEGAR_AQUI" | base64 -d > /data/prod.db'
