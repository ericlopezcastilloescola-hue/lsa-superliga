$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "deploy-data.zip"

$items = @()
$db = Join-Path $root "prisma\dev.db"
if (Test-Path $db) { $items += $db }

$uploads = Join-Path $root "public\uploads"
if (Test-Path $uploads) { $items += $uploads }

if ($items.Count -eq 0) {
  Write-Error "No hay dev.db ni public/uploads para empaquetar."
}

if (Test-Path $out) { Remove-Item $out -Force }
Compress-Archive -Path $items -DestinationPath $out -Force
Write-Host "Creado: $out"
Write-Host "Sube prod.db a /data/prod.db y uploads a /data/uploads en el servidor."
