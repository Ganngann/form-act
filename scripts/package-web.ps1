# Script de packaging pour Next.js (Standalone)
$ErrorActionPreference = "Stop"

Write-Host "Packaging du Frontend (Web)..."

# 1. Build
Write-Host "1. Exécution du build..."
pnpm build --filter web

# 2. Préparation du dossier de sortie
$distDir = "dist-web"
if (Test-Path $distDir) { Remove-Item -Recurse -Force $distDir }
New-Item -ItemType Directory -Path $distDir | Out-Null

# 3. Copie du Standalone (Base)
Write-Host "2. Copie des fichiers Standalone..."
# Attention : dans un monorepo, le standalone garde la structure des dossiers apps/web
Copy-Item -Recurse "apps\web\.next\standalone\*" "$distDir\"

# 4. Copie des assets statiques (Obligatoire pour le CSS/JS client)
Write-Host "3. Injection des assets statiques (.next/static)..."
$staticDest = "$distDir\apps\web\.next\static"
if (-not (Test-Path $staticDest)) { New-Item -ItemType Directory -Path $staticDest -Force | Out-Null }
Copy-Item -Recurse "apps\web\.next\static\*" "$staticDest\"

# 5. Copie du dossier Public
Write-Host "4. Injection du dossier public..."
$publicDest = "$distDir\apps\web\public"
if (-not (Test-Path $publicDest)) { New-Item -ItemType Directory -Path $publicDest -Force | Out-Null }
Copy-Item -Recurse "apps\web\public\*" "$publicDest\"

Write-Host "Termine !"
Write-Host "Le contenu du dossier '$distDir' est pret a etre uploade sur o2switch."
Write-Host "   Point d'entree (Startup File) : apps/web/server.js"
