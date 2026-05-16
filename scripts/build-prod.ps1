function Write-Log {
    param ([string]$Message, [string]$Color = "White")
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

$ErrorActionPreference = "Stop"
$RootDir = Get-Location

Write-Log "Starting Full Production Build..." "Cyan"

if (-not [string]::IsNullOrWhiteSpace($env:NEXT_PUBLIC_API_URL)) {
    Write-Log "Using API URL from Environment: $env:NEXT_PUBLIC_API_URL" "Magenta"
} else {
    Write-Log "Using default API URL from .env files" "Gray"
}

# 1. Build via Turbo
Write-Log "Packaging applications (Turbo --force)..." "Yellow"
pnpm build --force
if ($LASTEXITCODE -ne 0) { Write-Log "Build failed" "Red"; exit 1 }

# 2. Packaging API
Write-Log "Preparing api.zip..." "Yellow"
$TempApi = Join-Path $RootDir "temp_api"
if (Test-Path $TempApi) { Remove-Item $TempApi -Recurse -Force }
New-Item -ItemType Directory -Path $TempApi | Out-Null

Copy-Item -Path "apps/api/dist" -Destination $TempApi -Recurse
Copy-Item -Path "apps/api/package.json" -Destination $TempApi
New-Item -ItemType Directory -Path (Join-Path $TempApi "prisma") | Out-Null
$SchemaContent = Get-Content "apps/api/prisma/schema.prisma" -Raw
$SchemaContent = $SchemaContent -replace 'provider = "sqlite"', 'provider = "mysql"'
$SchemaContent = $SchemaContent -replace '// @db.LongText', '@db.LongText'
$SchemaContent | Set-Content (Join-Path $TempApi "prisma/schema.prisma") -NoNewline

Copy-Item -Path "apps/api/prisma/seed.ts" -Destination (Join-Path $TempApi "prisma")
if (Test-Path "apps/api/prisma/migrations") {
    Copy-Item -Path "apps/api/prisma/migrations" -Destination (Join-Path $TempApi "prisma") -Recurse
}

if (Test-Path "api.zip") { Remove-Item "api.zip" -Force }
Set-Location $TempApi
tar -a -c -f "$RootDir\api.zip" *
Set-Location $RootDir
Remove-Item $TempApi -Recurse -Force
Write-Log "api.zip created." "Green"

# 3. Packaging WEB
Write-Log "Preparing web.zip..." "Yellow"
$TempWeb = Join-Path $RootDir "temp_web"
if (Test-Path $TempWeb) { Remove-Item $TempWeb -Recurse -Force }
New-Item -ItemType Directory -Path $TempWeb | Out-Null

Copy-Item -Path "apps/web/.next" -Destination $TempWeb -Recurse
Copy-Item -Path "apps/web/package.json" -Destination $TempWeb
Copy-Item -Path "apps/web/next.config.js" -Destination $TempWeb
Copy-Item -Path "apps/web/server.js" -Destination $TempWeb
if (Test-Path "apps/web/public") {
    Copy-Item -Path "apps/web/public" -Destination $TempWeb -Recurse
}

if (Test-Path "web.zip") { Remove-Item "web.zip" -Force }
Set-Location $TempWeb
tar -a -c -f "$RootDir\web.zip" *
Set-Location $RootDir
Remove-Item $TempWeb -Recurse -Force
Write-Log "web.zip created." "Green"

Write-Log "Production build completed successfully!" "Cyan"
Write-Log "Upload api.zip and web.zip to your o2switch server." "White"
