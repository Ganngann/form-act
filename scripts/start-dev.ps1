function Write-Log {
    param (
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

$ErrorActionPreference = "Stop"

Write-Log "🚀 Initializing Form-Act Project for Windows..." "Cyan"

# 1. Install Dependencies
Write-Log "📦 Installing dependencies..." "Yellow"
pnpm install
if ($LASTEXITCODE -ne 0) { Write-Log "❌ Dependency install failed" "Red"; exit 1 }

# 2. Setup Environment
Write-Log "⚙️ Setting up environment..." "Yellow"
$ApiEnvPath = "apps\api\.env"
$ApiEnvExamplePath = "apps\api\.env.example"

if (-not (Test-Path $ApiEnvPath)) {
    if (Test-Path $ApiEnvExamplePath) {
        Copy-Item $ApiEnvExamplePath $ApiEnvPath
        Write-Log "✅ apps/api/.env created from example." "Green"
    } else {
        Write-Log "⚠️ .env.example not found in apps/api!" "Red"
    }
} else {
    Write-Log "ℹ️ apps/api/.env already exists." "Gray"
}

# 3. Generate Prisma Client
Write-Log "🧱 Generating Prisma Client..." "Yellow"
Set-Location "apps/api"
try {
    pnpm prisma generate
} finally {
    Set-Location "..\.."
}

# 4. Push Schema to DB (using migrate dev for consistent history or db push for prototyping)
# Using migrate dev --name init is safer if we want to track migrations, but db push is faster for pure dev.
# Given previous steps used migrate, let's try migrate first, fallback to push if needed? 
# Actually, 'prisma migrate dev' is interactive if name is missing. 'prisma db push' updates schema without history.
# For a "launch" script, 'migrate deploy' is for prod, 'migrate dev' is for dev.
Write-Log "💾 Applying database migrations..." "Yellow"
Set-Location "apps/api"
try {
    # Provide a name automatically if needed or use previous migration state
    # If migrations exists, just applying them.
    pnpm prisma migrate dev
} finally {
    Set-Location "..\.."
}

# 5. Seed Database
Write-Log "🌱 Seeding database..." "Yellow"
Set-Location "apps/api"
try {
    pnpm prisma db seed
} finally {
    Set-Location "..\.."
}

Write-Log "✅ Project initialized successfully!" "Green"
Write-Log "🚀 Starting development server..." "Cyan"
pnpm dev
