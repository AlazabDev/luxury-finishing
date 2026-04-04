param(
  [string]$AppName = "luxury-finishing",
  [string]$Port = "3007",
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "Deploying $AppName on port $Port with PM2..."

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  throw "pnpm is not installed or not available in PATH."
}

if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
  throw "pm2 is not installed or not available in PATH."
}

if (-not $SkipInstall) {
  Write-Host "Installing dependencies..."
  pnpm install --frozen-lockfile
}

Write-Host "Building production bundle..."
pnpm build

$env:PORT = $Port
$env:HOST = "0.0.0.0"
$env:NODE_ENV = "production"

Write-Host "Reloading PM2 process..."
pm2 startOrReload ecosystem.config.cjs --only $AppName --update-env

Write-Host "Saving PM2 process list..."
pm2 save

Write-Host "Deployment completed."
