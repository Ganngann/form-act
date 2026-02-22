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

# 4. Push Schema to DB
Write-Log "💾 Applying database migrations..." "Yellow"
Set-Location "apps/api"
try {
    # Using migrate dev --accept-utils or similar if needed, but for now just standard
    # We use --skip-generate because we just did it
    pnpm prisma migrate dev --skip-generate
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
