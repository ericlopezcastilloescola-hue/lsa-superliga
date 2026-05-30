# Copia la BD local a Turso SIN tocar el archivo .env
# Uso: .\scripts\sync-turso.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host ""
Write-Host "=== Copiar datos a Turso ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ve a https://app.turso.tech -> tu base de datos -> Connect"
Write-Host ""

$url = Read-Host "1) Pega la LibSQL URL (libsql://...)"
$token = Read-Host "2) Pega el Auth Token (empieza por eyJ...)"

$url = $url.Trim().Replace("libsql://libsql://", "libsql://")
$token = $token.Trim().Replace("libsql://", "")

if (-not $url.StartsWith("libsql://")) {
  Write-Host "Error: la URL debe empezar por libsql://" -ForegroundColor Red
  exit 1
}
if ($token.Length -lt 20) {
  Write-Host "Error: el token parece incompleto." -ForegroundColor Red
  exit 1
}

$env:TURSO_DATABASE_URL = $url
$env:TURSO_AUTH_TOKEN = $token

Write-Host ""
Write-Host "Copiando datos..." -ForegroundColor Yellow
npm run db:sync-turso
